import { NextResponse } from "next/server";
import { hasSuiCredentials } from "@/lib/config";
import { anchorReceiptBatchOnchain } from "@/lib/sui-anchor";
import { listAnchors } from "@/lib/sui-anchor-store";
import { computeReceiptBatchHash } from "@/lib/receipt";

export async function GET() {
  const anchors = listAnchors();
  let pending: { batchHash: string; receiptCount: number } | null = null;
  try {
    pending = await computeReceiptBatchHash();
  } catch {
    pending = null;
  }
  return NextResponse.json({
    suiConfigured: hasSuiCredentials(),
    anchors,
    pendingBatch: pending,
  });
}

export async function POST() {
  if (!hasSuiCredentials()) {
    return NextResponse.json(
      {
        error:
          "SUI_PRIVATE_KEY missing in .env. Fund the wallet, then POST again (or npm run publish:anchor first).",
      },
      { status: 400 },
    );
  }
  try {
    const anchor = await anchorReceiptBatchOnchain();
    return NextResponse.json(anchor);
  } catch (err) {
    const message = err instanceof Error ? err.message : "anchor failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
