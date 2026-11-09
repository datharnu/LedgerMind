import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { verifyReceiptChain } from "@/lib/receipt-crypto";
import type { ExhibitPack } from "@/lib/receipt-types";

describe("exhibit-chain.json", () => {
  it("verifies PASS in Node (same code as the browser)", async () => {
    const raw = readFileSync(
      join(process.cwd(), "public/samples/exhibit-chain.json"),
      "utf8",
    );
    const pack = JSON.parse(raw) as ExhibitPack;
    const { fullChainPass, stepResults } = await verifyReceiptChain(pack.receipts);
    expect(fullChainPass).toBe(true);
    const blocked = stepResults.find((s) => s.tool === "read_card_details");
    expect(blocked?.policyDecision).toBe("block");
    expect(blocked?.signatureValid).toBe(true);
  });

  it("FAILs when content hash is tampered", async () => {
    const raw = readFileSync(
      join(process.cwd(), "public/samples/exhibit-chain.json"),
      "utf8",
    );
    const pack = JSON.parse(raw) as ExhibitPack;
    const tampered = pack.receipts.map((r) => ({ ...r }));
    tampered[5]!.contentHash = tampered[5]!.contentHash.replace(/.$/, "0");
    const { fullChainPass } = await verifyReceiptChain(tampered);
    expect(fullChainPass).toBe(false);
  });
});
