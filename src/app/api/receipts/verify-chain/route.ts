import { NextResponse } from "next/server";
import { verifyReceiptChain } from "@/lib/receipt-crypto";
import { getProxyPublicKeyHex, listReceipts } from "@/lib/receipt";

export async function GET() {
  const receipts = listReceipts();
  const { fullChainPass, stepResults } = await verifyReceiptChain(receipts);

  return NextResponse.json({
    publicKey: getProxyPublicKeyHex(),
    receiptCount: receipts.length,
    fullChainPass,
    receipts,
    stepResults,
  });
}
