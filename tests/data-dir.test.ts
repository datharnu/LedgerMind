import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { dataDir } from "@/lib/data-dir";
import {
  loadReceiptsFromDisk,
  saveReceiptsToDisk,
} from "@/lib/receipt-store";
import type { SignedReceipt } from "@/lib/receipt-types";

const previous = {
  vercel: process.env.VERCEL,
  dir: process.env.LEDGERMIND_DATA_DIR,
};

afterEach(() => {
  if (previous.vercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previous.vercel;
  if (previous.dir === undefined) delete process.env.LEDGERMIND_DATA_DIR;
  else process.env.LEDGERMIND_DATA_DIR = previous.dir;
});

describe("dataDir", () => {
  it("uses /tmp on Vercel so mkdir does not target /var/task/data", () => {
    delete process.env.LEDGERMIND_DATA_DIR;
    process.env.VERCEL = "1";
    expect(dataDir()).toBe(path.join(tmpdir(), "ledgermind"));
  });

  it("keeps the local data/ directory off Vercel", () => {
    delete process.env.LEDGERMIND_DATA_DIR;
    delete process.env.VERCEL;
    expect(dataDir()).toBe(path.join(process.cwd(), "data"));
  });

  it("round-trips a receipt under an override directory", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "ledgermind-store-"));
    process.env.LEDGERMIND_DATA_DIR = dir;
    const receipt = {
      id: "r1",
      sequence: 1,
      contentHash: "abc",
    } as SignedReceipt;

    saveReceiptsToDisk([receipt]);
    expect(loadReceiptsFromDisk()).toEqual([receipt]);
    const raw = readFileSync(path.join(dir, "receipts.json"), "utf8");
    expect(raw).toContain('"id": "r1"');
    rmSync(dir, { recursive: true, force: true });
  });
});
