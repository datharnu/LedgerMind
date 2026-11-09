import { NextResponse } from "next/server";
import { fetchLatestCheckpoint } from "@/lib/tatum";

export async function GET() {
  try {
    const checkpoint = await fetchLatestCheckpoint();
    return NextResponse.json(checkpoint);
  } catch (err) {
    const message = err instanceof Error ? err.message : "checkpoint failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
