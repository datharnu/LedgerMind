import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import type { SignedReceipt } from "@/lib/receipt";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "receipts.json");

export function loadReceiptsFromDisk(): SignedReceipt[] {
  if (!existsSync(FILE)) return [];
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as SignedReceipt[];
  } catch {
    return [];
  }
}

export function saveReceiptsToDisk(receipts: SignedReceipt[]) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(receipts, null, 2));
}
