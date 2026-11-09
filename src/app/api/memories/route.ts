import { NextResponse } from "next/server";
import { recallSpendingRules, memwalHealth } from "@/lib/memwal-client";
import { hasMemwalCredentials } from "@/lib/config";

export async function GET() {
  if (!hasMemwalCredentials()) {
    return NextResponse.json({
      configured: false,
      health: null,
      memories: [],
    });
  }

  try {
    const [health, recalled] = await Promise.all([
      memwalHealth(),
      recallSpendingRules(25),
    ]);
    return NextResponse.json({
      configured: true,
      health,
      memories: recalled.results,
      total: recalled.total,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "memories failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
