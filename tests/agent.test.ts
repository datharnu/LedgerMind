import { describe, it, expect } from "vitest";
import { suggestWithMemories, type SubscriptionCandidate } from "@/lib/agent";

const candidate45: SubscriptionCandidate = {
  id: "x",
  name: "StreamBox Plus",
  priceMonthly: 45,
  category: "entertainment",
};

describe("Agent behavior change", () => {
  it("filters ¥45 candidate when memories cap at 40", () => {
    const memories = [
      "User rejected subscription Foo at USD40/month because: too expensive.",
      "User rejected subscription Bar at USD39/month because: too expensive.",
      "User rejected subscription Baz at USD38/month because: over budget.",
    ];
    const result = suggestWithMemories([candidate45], memories);
    expect(result.suggestions).toHaveLength(0);
    expect(result.filteredOut[0]?.reason).toMatch(/learned cap/i);
  });

  it("suggests again when memories cleared", () => {
    const result = suggestWithMemories([candidate45], []);
    expect(result.suggestions).toHaveLength(1);
  });

  it("drops accepted subscriptions from suggestions", () => {
    const memories = [
      "User accepted subscription StreamBox Plus at USD45/month category entertainment.",
    ];
    const result = suggestWithMemories([candidate45], memories);
    expect(result.suggestions).toHaveLength(0);
  });
});
