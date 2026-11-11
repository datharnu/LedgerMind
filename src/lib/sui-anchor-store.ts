import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { dataDir } from "@/lib/data-dir";

export type OnchainAnchorRecord = {
  batchHash: string;
  receiptCount: number;
  digest: string;
  packageId: string;
  sender: string;
  tatumCheckpoint?: string;
  anchoredAt: string;
};

function anchorFile(): string {
  return path.join(dataDir(), "receipt-anchors.json");
}

export function listAnchors(): OnchainAnchorRecord[] {
  const file = anchorFile();
  if (!existsSync(file)) return [];
  try {
    return JSON.parse(readFileSync(file, "utf8")) as OnchainAnchorRecord[];
  } catch {
    return [];
  }
}

export function saveAnchor(record: OnchainAnchorRecord) {
  const file = anchorFile();
  const prev = listAnchors();
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify([...prev, record], null, 2));
}
