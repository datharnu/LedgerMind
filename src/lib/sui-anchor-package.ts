import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { getConfig, SUI_FRAMEWORK_PACKAGE_ID } from "@/lib/config";

const DATA = path.join(process.cwd(), "data", "sui-anchor-package.json");
const MODULE_PATH = path.join(process.cwd(), "move", "artifacts", "anchor.mv");

export type AnchorPackageRecord = {
  packageId: string;
  digest: string;
  publishedAt: string;
};

export function loadAnchorPackageId(): string | null {
  const envId = getConfig().SUI_ANCHOR_PACKAGE_ID;
  if (envId) return envId;
  if (!existsSync(DATA)) return null;
  try {
    const rec = JSON.parse(readFileSync(DATA, "utf8")) as AnchorPackageRecord;
    return rec.packageId ?? null;
  } catch {
    return null;
  }
}

export function saveAnchorPackageRecord(record: AnchorPackageRecord) {
  mkdirSync(path.dirname(DATA), { recursive: true });
  writeFileSync(DATA, JSON.stringify(record, null, 2));
}

export function loadAnchorModuleBytes(): Uint8Array {
  if (!existsSync(MODULE_PATH)) {
    throw new Error(
      "Missing move/artifacts/anchor.mv — run `sui move build` in move/ledgermind",
    );
  }
  return readFileSync(MODULE_PATH);
}

const MOVE_STDLIB_PACKAGE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

export function getPublishDependencies(): string[] {
  // On-chain 0x2 links to MoveStdlib 0x1. Leaving 0x1 out fails publish
  // with PublishUpgradeMissingDependency.
  return [MOVE_STDLIB_PACKAGE_ID, SUI_FRAMEWORK_PACKAGE_ID];
}
