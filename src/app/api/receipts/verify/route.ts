import { NextResponse } from "next/server";
import { z } from "zod";
import { getReceiptById, verifyReceipt } from "@/lib/receipt";

const bodySchema = z.object({
  id: z.string().uuid(),
});

export async function POST(req: Request) {
  const json = await req.json();
  const { id } = bodySchema.parse(json);
  const receipt = getReceiptById(id);
  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }
  const verification = await verifyReceipt(receipt);
  return NextResponse.json({ receipt, verification });
}
