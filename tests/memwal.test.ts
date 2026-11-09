import { describe, it, expect } from "vitest";
import {
  memwalHealth,
  rememberFact,
  recallSpendingRules,
  formatSpendingMemory,
} from "@/lib/memwal-client";

const hasMemwal =
  Boolean(process.env.MEMWAL_PRIVATE_KEY) &&
  Boolean(process.env.MEMWAL_ACCOUNT_ID);

describe.skipIf(!hasMemwal)("Walrus Memory Mainnet", () => {
  it("health check returns ok", async () => {
    const h = await memwalHealth();
    expect(h.status).toBeTruthy();
  });

  it("write-read cycle", async () => {
    const text = formatSpendingMemory({
      action: "rejected",
      name: `Vitest Probe ${Date.now()}`,
      priceMonthly: 41,
      reason: "too expensive",
      category: "test",
    });
    const written = await rememberFact(text);
    expect(written.blobId).toBeTruthy();

    const recalled = await recallSpendingRules(10);
    const hit = recalled.results.find((r) => r.text.includes("Vitest Probe"));
    expect(hit).toBeDefined();
  });
});
