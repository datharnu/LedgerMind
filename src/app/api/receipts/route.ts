import { NextResponse } from "next/server";
import { listReceipts, getProxyPublicKeyHex } from "@/lib/receipt";

export async function GET() {
  return NextResponse.json({
    publicKey: getProxyPublicKeyHex(),
    receipts: listReceipts(),
  });
}
