import { describe, it, expect, beforeEach } from "vitest";
import {
  issueReceipt,
  resetReceiptChainForTests,
  verifyReceipt,
  verifyFullChain,
  getReceiptById,
} from "@/lib/receipt";

beforeEach(() => {
  resetReceiptChainForTests();
});

describe("Receipt layer", () => {
  it("generates a valid Ed25519 signature", async () => {
    const r = await issueReceipt({
      tool: "query_price",
      inputSummary: "test",
      attachCheckpoint: false,
    });
    const v = await verifyReceipt(r);
    expect(v.signatureValid).toBe(true);
    expect(v.errors).toHaveLength(0);
  });

  it("detects hash chain tampering", async () => {
    const a = await issueReceipt({
      tool: "query_price",
      inputSummary: "a",
      attachCheckpoint: false,
    });
    await issueReceipt({
      tool: "query_price",
      inputSummary: "b",
      attachCheckpoint: false,
    });
    const mid = getReceiptById(a.id)!;
    const tampered = { ...mid, inputSummary: "tampered" };
    const v = await verifyReceipt(tampered);
    expect(v.signatureValid).toBe(false);
    expect(v.errors.length).toBeGreaterThan(0);
  });

  it("blocks secret read tool in policy receipt", async () => {
    const r = await issueReceipt({
      tool: "read_card_details",
      inputSummary: "attempt",
      attachCheckpoint: false,
    });
    expect(r.policyDecision).toBe("block");
    expect(await verifyFullChain()).toBe(true);
  });

  it("chains three receipts", async () => {
    for (let i = 0; i < 3; i++) {
      await issueReceipt({
        tool: "query_price",
        inputSummary: `n=${i}`,
        attachCheckpoint: false,
      });
    }
    expect(await verifyFullChain()).toBe(true);
  });
});
