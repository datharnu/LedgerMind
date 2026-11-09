import { NextResponse } from "next/server";
import { z } from "zod";
import { recordFeedback } from "@/lib/agent";
import { DEFAULT_CANDIDATES } from "@/lib/demo-catalog";

const bodySchema = z.object({
  candidateId: z.string(),
  action: z.enum(["accepted", "rejected"]),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.parse(json);
    const candidate = DEFAULT_CANDIDATES.find((c) => c.id === parsed.candidateId);
    if (!candidate) {
      return NextResponse.json({ error: "Unknown candidate" }, { status: 400 });
    }

    const result = await recordFeedback({
      action: parsed.action,
      candidate,
      reason: parsed.reason,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "feedback failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
