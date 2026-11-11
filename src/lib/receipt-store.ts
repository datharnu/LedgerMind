import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import type { SignedReceipt } from "@/lib/receipt";
import { dataDir } from "@/lib/data-dir";

function receiptFile(): string {
  return path.join(dataDir(), "receipts.json");
}

export function loadReceiptsFromDisk(): SignedReceipt[] {
  const file = receiptFile();
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf8")) as SignedReceipt[];
  } catch {
    return [];
  }
}

export function saveReceiptsToDisk(receipts: SignedReceipt[]) {
  const file = receiptFile();
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(receipts, null, 2));
}
