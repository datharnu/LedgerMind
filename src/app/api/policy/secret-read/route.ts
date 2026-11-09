import { NextResponse } from "next/server";
import { attemptSecretRead } from "@/lib/agent";

export async function POST() {
  const receipt = await attemptSecretRead();
  return NextResponse.json({
    allowed: false,
    receipt,
  });
}
