import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { sha256 } from "@noble/hashes/sha256";
import type { ReceiptPayload, SignedReceipt } from "@/lib/receipt-types";

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error("invalid hex");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Canonical payload hash — must match `src/lib/receipt.ts` on the server. */
export async function hashReceiptContent(
  payload: Omit<ReceiptPayload, "contentHash">,
): Promise<string> {
  const canonical = JSON.stringify({
    id: payload.id,
    sequence: payload.sequence,
    tool: payload.tool,
    timestamp: payload.timestamp,
    policyDecision: payload.policyDecision,
    policyReason: payload.policyReason,
    inputSummary: payload.inputSummary,
    previousHash: payload.previousHash,
    suiCheckpoint: payload.suiCheckpoint ?? null,
  });
  return bytesToHex(sha256(new TextEncoder().encode(canonical)));
}

export type StepVerifyResult = {
  id: string;
  sequence: number;
  tool: string;
  policyDecision: string;
  signatureValid: boolean;
  chainIntact: boolean;
  errors: string[];
};

export async function verifyReceiptChain(receipts: SignedReceipt[]): Promise<{
  fullChainPass: boolean;
  publicKey: string | null;
  stepResults: StepVerifyResult[];
}> {
  const stepResults: StepVerifyResult[] = [];
  let fullChainPass = receipts.length > 0;

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    const errors: string[] = [];
    const prev = i > 0 ? receipts[i - 1] : null;

    const base: Omit<ReceiptPayload, "contentHash"> = {
      id: receipt.id,
      sequence: receipt.sequence,
      tool: receipt.tool,
      timestamp: receipt.timestamp,
      policyDecision: receipt.policyDecision,
      policyReason: receipt.policyReason,
      inputSummary: receipt.inputSummary,
      previousHash: receipt.previousHash,
      suiCheckpoint: receipt.suiCheckpoint,
    };
    const contentValid = (await hashReceiptContent(base)) === receipt.contentHash;
    if (!contentValid) {
      errors.push("Content hash mismatch (payload may have been tampered)");
    }

    let signatureValid = false;
    if (contentValid) {
      try {
        signatureValid = await ed.verify(
          hexToBytes(receipt.signature),
          new TextEncoder().encode(receipt.contentHash),
          hexToBytes(receipt.publicKey),
        );
      } catch {
        signatureValid = false;
      }
      if (!signatureValid) errors.push("Ed25519 signature invalid");
    }

    const expectedPrev = prev?.contentHash ?? null;
    const chainIntact = receipt.previousHash === expectedPrev;
    if (!chainIntact) {
      errors.push(`Chain break at sequence ${receipt.sequence}`);
    }

    if (!signatureValid || !chainIntact || !contentValid) {
      fullChainPass = false;
    }

    stepResults.push({
      id: receipt.id,
      sequence: receipt.sequence,
      tool: String(receipt.tool),
      policyDecision: receipt.policyDecision,
      signatureValid: contentValid && signatureValid,
      chainIntact,
      errors,
    });
  }

  return {
    fullChainPass: fullChainPass && receipts.length > 0,
    publicKey: receipts[0]?.publicKey ?? null,
    stepResults,
  };
}
