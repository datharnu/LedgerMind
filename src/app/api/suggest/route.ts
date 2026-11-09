import { NextResponse } from "next/server";
import { getSuggestions } from "@/lib/agent";
import { DEFAULT_CANDIDATES } from "@/lib/demo-catalog";

export async function GET() {
  try {
    const result = await getSuggestions(DEFAULT_CANDIDATES);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "suggest failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
