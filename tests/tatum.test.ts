import { describe, it, expect } from "vitest";
import { fetchLatestCheckpoint } from "@/lib/tatum";
import { issueReceipt, resetReceiptChainForTests } from "@/lib/receipt";

const hasKey = Boolean(process.env.TATUM_API_KEY);

describe.skipIf(!hasKey)("Tatum GraphQL", () => {
  it("returns latest checkpoint sequence number", async () => {
    const cp = await fetchLatestCheckpoint();
    expect(cp.sequenceNumber).toBeTruthy();
    expect(Number(cp.sequenceNumber)).toBeGreaterThan(0);
  });

  it("stores checkpoint on allowed receipt", async () => {
    resetReceiptChainForTests();
    const r = await issueReceipt({
      tool: "log_spending",
      inputSummary: "integration",
    });
    expect(r.suiCheckpoint).toBeTruthy();
  });
});
