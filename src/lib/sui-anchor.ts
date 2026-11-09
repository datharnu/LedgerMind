import { Transaction } from "@mysten/sui/transactions";
import { computeReceiptBatchHash } from "@/lib/receipt";
import { fetchLatestCheckpoint } from "@/lib/tatum";
import { getSuiGrpcClient } from "@/lib/sui-client";
import { getSuiSigner } from "@/lib/sui-keypair";
import { hasSuiCredentials } from "@/lib/config";
import {
  loadAnchorModuleBytes,
  loadAnchorPackageId,
  saveAnchorPackageRecord,
  getPublishDependencies,
  type AnchorPackageRecord,
} from "@/lib/sui-anchor-package";
import { saveAnchor, type OnchainAnchorRecord } from "@/lib/sui-anchor-store";
import {
  assertExecutedSuccess,
  getExecutedDigest,
  type GrpcExecuteShape,
} from "@/lib/sui-tx-result";

const ANCHOR_LABEL = "ledgermind-receipt-batch-v1";

export function assertSuiConfigured(): void {
  if (!hasSuiCredentials()) {
    throw new Error(
      "SUI_PRIVATE_KEY is not configured. Add it to .env (64-char hex or suiprivkey1…), fund the wallet on Sui testnet, then run npm run publish:anchor once.",
    );
  }
}

function hexToBytes(hex: string): number[] {
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  return [...Buffer.from(h, "hex")];
}

async function packageIdFromUpgradeCap(
  client: ReturnType<typeof getSuiGrpcClient>,
  owner: string,
  digest: string,
): Promise<string | null> {
  const owned = await client.listOwnedObjects({
    owner,
    type: "0x2::package::UpgradeCap",
    limit: 20,
    include: { json: true, previousTransaction: true },
  });
  const caps = owned.objects.filter(
    (obj) => obj.previousTransaction === digest,
  );
  const cap = caps[0] ?? owned.objects[0];
  const json = cap?.json as { package?: string } | null | undefined;
  return typeof json?.package === "string" ? json.package : null;
}

function extractPublishedPackageId(changes: unknown): string | null {
  if (!Array.isArray(changes)) return null;
  for (const c of changes) {
    if (!c || typeof c !== "object") continue;
    const row = c as Record<string, unknown>;
    const kind = row.$kind ?? row.type ?? row.changeType;
    if (kind === "published" || kind === "Published") {
      const id = row.packageId ?? row.package;
      if (typeof id === "string") return id;
    }
  }
  return null;
}

/** One-time Sui testnet publish of ledgermind::anchor (gRPC, not JSON-RPC). */
export async function publishAnchorPackage(): Promise<AnchorPackageRecord> {
  assertSuiConfigured();
  const client = getSuiGrpcClient();
  const signer = getSuiSigner();
  const sender = signer.getPublicKey().toSuiAddress();
  const modules = [Array.from(loadAnchorModuleBytes())];

  const tx = new Transaction();
  tx.setSender(sender);
  // Publish returns an UpgradeCap. Leaving it unused fails with UnusedValueWithoutDrop.
  const upgradeCap = tx.publish({ modules, dependencies: getPublishDependencies() });
  tx.transferObjects([upgradeCap], sender);

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    include: { effects: true },
  });

  const shaped = result as unknown as GrpcExecuteShape;
  assertExecutedSuccess(shaped);
  const digest = getExecutedDigest(shaped);

  let packageId = extractPublishedPackageId(shaped.Transaction?.objectChanges);
  if (!packageId) {
    // 2026-11-09: gRPC effects do not include JSON-RPC objectChanges. A publish
    // that landed on-chain used to throw here and leave the package unrecorded.
    packageId = await packageIdFromUpgradeCap(client, sender, digest);
  }
  if (!packageId) {
    throw new Error(
      `Publish succeeded (digest ${digest}) but the package id was not on the UpgradeCap`,
    );
  }

  const record: AnchorPackageRecord = {
    packageId,
    digest,
    publishedAt: new Date().toISOString(),
  };
  saveAnchorPackageRecord(record);
  return record;
}

/**
 * Anchor the current receipt batch on Sui testnet.
 * Sui has no transfer memo field; we pair a 1 MIST self-transfer with an event emit (memo equivalent).
 */
export async function anchorReceiptBatchOnchain(): Promise<OnchainAnchorRecord> {
  assertSuiConfigured();

  let packageId = loadAnchorPackageId();
  if (!packageId) {
    const published = await publishAnchorPackage();
    packageId = published.packageId;
  }

  const { batchHash, receiptCount } = await computeReceiptBatchHash();
  const client = getSuiGrpcClient();
  const signer = getSuiSigner();
  const sender = signer.getPublicKey().toSuiAddress();

  const tx = new Transaction();
  tx.setSender(sender);

  // "Memo leg": minimal value transfer in the same PTB as the anchor event.
  const [dust] = tx.splitCoins(tx.gas, [1]);
  tx.transferObjects([dust], sender);

  tx.moveCall({
    target: `${packageId}::anchor::anchor_batch`,
    arguments: [
      tx.pure.vector("u8", hexToBytes(batchHash)),
      tx.pure.vector("u8", [...Buffer.from(ANCHOR_LABEL, "utf8")]),
    ],
  });

  let tatumCheckpoint: string | undefined;
  try {
    const cp = await fetchLatestCheckpoint();
    tatumCheckpoint = cp.sequenceNumber;
  } catch {
    // non-fatal
  }

  const result = await client.signAndExecuteTransaction({
    signer,
    transaction: tx,
    include: { effects: true, events: true },
  });

  const shaped = result as unknown as GrpcExecuteShape;
  assertExecutedSuccess(shaped);
  const digest = getExecutedDigest(shaped);

  const record: OnchainAnchorRecord = {
    batchHash,
    receiptCount,
    digest,
    packageId,
    sender,
    tatumCheckpoint,
    anchoredAt: new Date().toISOString(),
  };
  saveAnchor(record);
  return record;
}
