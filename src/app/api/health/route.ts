import { NextResponse } from "next/server";
import {
  hasMemwalCredentials,
  hasSuiCredentials,
  hasTatumCredentials,
} from "@/lib/config";

export async function GET() {
  return NextResponse.json({
    ok: true,
    memwalConfigured: hasMemwalCredentials(),
    tatumConfigured: hasTatumCredentials(),
    suiConfigured: hasSuiCredentials(),
  });
}
