import { describe, it, expect } from "vitest";
import { computeReceiptBatchHash, issueReceipt, resetReceiptChainForTests } from "@/lib/receipt";
import { assertSuiConfigured } from "@/lib/sui-anchor";

const hasSui = Boolean(process.env.SUI_PRIVATE_KEY);

describe("Receipt batch hash", () => {
  it("requires at least one receipt", async () => {
    resetReceiptChainForTests();
    await expect(computeReceiptBatchHash()).rejects.toThrow(/No receipts/);
  });

  it("is stable for a fixed chain", async () => {
    resetReceiptChainForTests();
    await issueReceipt({
      tool: "query_price",
      inputSummary: "a",
      attachCheckpoint: false,
    });
    const h1 = await computeReceiptBatchHash();
    const h2 = await computeReceiptBatchHash();
    expect(h1.batchHash).toBe(h2.batchHash);
  });
});

describe.skipIf(!hasSui)("Sui onchain anchor", () => {
  it("assertSuiConfigured passes", () => {
    expect(() => assertSuiConfigured()).not.toThrow();
  });
});
