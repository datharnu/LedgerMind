import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { randomBytes } from "node:crypto";
import { fetchLatestCheckpoint } from "@/lib/tatum";
import { evaluatePolicy, type ToolName } from "@/lib/policy";
import { getConfig } from "@/lib/config";
import {
  loadReceiptsFromDisk,
  saveReceiptsToDisk,
} from "@/lib/receipt-store";
import { hashReceiptContent, verifyReceiptChain } from "@/lib/receipt-crypto";
import type { ReceiptPayload, SignedReceipt } from "@/lib/receipt-types";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

export type { ReceiptPayload, SignedReceipt };

function bytesToHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

function hexToBytes(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, "hex"));
}

let proxySecret: Uint8Array | null = null;
let receiptChain: SignedReceipt[] | null = null;

function getChain(): SignedReceipt[] {
  if (!receiptChain) {
    receiptChain = loadReceiptsFromDisk();
  }
  return receiptChain;
}

export function resetReceiptChainForTests() {
  receiptChain = [];
}

export function hydrateReceiptChainFromDisk() {
  receiptChain = loadReceiptsFromDisk();
}

export function getProxyPublicKeyHex(): string {
  const sk = getProxySecretKey();
  const pk = ed.getPublicKey(sk);
  return bytesToHex(pk);
}

function getProxySecretKey(): Uint8Array {
  if (proxySecret) return proxySecret;
  const envHex = getConfig().RECEIPT_PROXY_SECRET_HEX;
  if (envHex) {
    proxySecret = hexToBytes(envHex);
    return proxySecret;
  }
  proxySecret = randomBytes(32);
  return proxySecret;
}

export async function issueReceipt(input: {
  tool: ToolName;
  inputSummary: string;
  attachCheckpoint?: boolean;
}): Promise<SignedReceipt> {
  const policy = evaluatePolicy(input.tool);
  const chain = getChain();
  const previous = chain.at(-1);
  const previousHash = previous?.contentHash ?? null;

  let suiCheckpoint: string | undefined;
  if (input.attachCheckpoint !== false && policy.decision === "allow") {
    try {
      const cp = await fetchLatestCheckpoint();
      suiCheckpoint = cp.sequenceNumber;
    } catch {
      // Demo still works without Tatum in local dev
    }
  }

  const base = {
    id: crypto.randomUUID(),
    sequence: chain.length + 1,
    tool: input.tool,
    timestamp: new Date().toISOString(),
    policyDecision: policy.decision,
    policyReason: policy.reason,
    inputSummary: input.inputSummary,
    previousHash,
    suiCheckpoint,
  } as Omit<ReceiptPayload, "contentHash">;

  const contentHash = await hashReceiptContent(base);
  const payload: ReceiptPayload = { ...base, contentHash };

  const message = new TextEncoder().encode(contentHash);
  const signature = await ed.sign(message, getProxySecretKey());
  const signed: SignedReceipt = {
    ...payload,
    signature: bytesToHex(signature),
    publicKey: getProxyPublicKeyHex(),
  };

  chain.push(signed);
  saveReceiptsToDisk(chain);
  return signed;
}

export function listReceipts(): SignedReceipt[] {
  return [...getChain()];
}

export function getReceiptById(id: string): SignedReceipt | undefined {
  return getChain().find((r) => r.id === id);
}

export async function verifyReceipt(receipt: SignedReceipt): Promise<{
  signatureValid: boolean;
  chainIntact: boolean;
  errors: string[];
}> {
  const chain = getChain();
  const idx = chain.findIndex((r) => r.id === receipt.id);
  if (idx < 0) {
    const { stepResults } = await verifyReceiptChain([receipt]);
    const step = stepResults[0];
    const errors = step ? [...step.errors] : ["Receipt not in chain"];
    if (receipt.previousHash) errors.push("Receipt not found in local chain");
    return {
      signatureValid: step?.signatureValid ?? false,
      chainIntact: false,
      errors,
    };
  }
  const prefix = chain
    .slice(0, idx + 1)
    .map((r, i) => (i === idx ? receipt : r));
  const { stepResults } = await verifyReceiptChain(prefix);
  const step = stepResults.at(-1)!;
  return {
    signatureValid: step.signatureValid,
    chainIntact: step.chainIntact,
    errors: step.errors,
  };
}

export async function verifyFullChain(): Promise<boolean> {
  const chain = getChain();
  const { fullChainPass } = await verifyReceiptChain(chain);
  return fullChainPass;
}

/** SHA-256 hex over receipt content hashes in sequence (batch anchor digest). */
export async function computeReceiptBatchHash(): Promise<{
  batchHash: string;
  receiptCount: number;
  tipContentHash: string | null;
}> {
  const chain = getChain();
  if (chain.length === 0) {
    throw new Error("No receipts in chain to anchor");
  }
  const { sha256 } = await import("@noble/hashes/sha256");
  const canonical = chain.map((r) => r.contentHash).join("|");
  const batchHash = bytesToHex(sha256(new TextEncoder().encode(canonical)));
  return {
    batchHash,
    receiptCount: chain.length,
    tipContentHash: chain.at(-1)?.contentHash ?? null,
  };
}
