import "dotenv/config";
import { assertSuiConfigured, publishAnchorPackage } from "../src/lib/sui-anchor";

async function main() {
  assertSuiConfigured();
  const rec = await publishAnchorPackage();
  console.log("Published ledgermind::anchor on Sui testnet");
  console.log("packageId:", rec.packageId);
  console.log("digest:", rec.digest);
  console.log("Saved data/sui-anchor-package.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
