import { describe, it, expect, beforeEach } from "vitest";
import { suggestWithMemories, type SubscriptionCandidate } from "@/lib/agent";
import {
  issueReceipt,
  resetReceiptChainForTests,
  verifyFullChain,
} from "@/lib/receipt";
import { evaluatePolicy } from "@/lib/policy";

beforeEach(() => {
  resetReceiptChainForTests();
});

describe("E2E demo (local, no Walrus)", () => {
  it("empty → interactions → filter → receipts", async () => {
    const candidates: SubscriptionCandidate[] = [
      { id: "1", name: "A", priceMonthly: 12, category: "x" },
      { id: "2", name: "StreamBox Plus", priceMonthly: 45, category: "ent" },
    ];

    let r1 = suggestWithMemories(candidates, []);
    expect(r1.suggestions.some((s) => s.priceMonthly === 45)).toBe(true);

    const memories = [
      "User rejected subscription StreamBox Plus at USD45/month because: too expensive.",
    ];
    await issueReceipt({ tool: "query_price", inputSummary: "price", attachCheckpoint: false });
    await issueReceipt({ tool: "log_spending", inputSummary: "reject", attachCheckpoint: false });
    await issueReceipt({ tool: "suggest_subscription", inputSummary: "suggest", attachCheckpoint: false });

    r1 = suggestWithMemories(candidates, memories);
    expect(r1.suggestions.some((s) => s.name === "StreamBox Plus")).toBe(false);

    const blocked = evaluatePolicy("read_card_details");
    expect(blocked.decision).toBe("block");
    await issueReceipt({
      tool: "read_card_details",
      inputSummary: "secret",
      attachCheckpoint: false,
    });

    expect(await verifyFullChain()).toBe(true);
  });
});
