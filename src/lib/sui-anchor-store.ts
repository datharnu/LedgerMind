import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

export type OnchainAnchorRecord = {
  batchHash: string;
  receiptCount: number;
  digest: string;
  packageId: string;
  sender: string;
  tatumCheckpoint?: string;
  anchoredAt: string;
};

const FILE = path.join(process.cwd(), "data", "receipt-anchors.json");

export function listAnchors(): OnchainAnchorRecord[] {
  if (!existsSync(FILE)) return [];
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as OnchainAnchorRecord[];
  } catch {
    return [];
  }
}

export function saveAnchor(record: OnchainAnchorRecord) {
  const prev = listAnchors();
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify([...prev, record], null, 2));
}
