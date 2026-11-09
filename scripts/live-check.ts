import "dotenv/config";
import { attemptSecretRead, getSuggestions } from "../src/lib/agent";
import { DEFAULT_CANDIDATES } from "../src/lib/demo-catalog";
import { issueReceipt, verifyReceipt } from "../src/lib/receipt";
import { fetchLatestCheckpoint } from "../src/lib/tatum";

async function main() {
const cp = await fetchLatestCheckpoint();
console.log(`CHECKPOINT=${cp.sequenceNumber} source=${cp.source}`);

const suggestions = await getSuggestions(DEFAULT_CANDIDATES);
console.log("SUGGESTED");
for (const s of suggestions.suggestions) {
  console.log(`  ALLOW ${s.name} ${s.priceMonthly}/mo`);
}
console.log("FILTERED");
for (const f of suggestions.filteredOut) {
  console.log(
    `  REFUSE ${f.candidate.name} ${f.candidate.priceMonthly}/mo — ${f.reason}`,
  );
}
console.log("MEMORIES_USED");
for (const m of suggestions.memoriesUsed) {
  console.log(`  ${m.blobId} | ${m.text}`);
}

const receipt = await issueReceipt({
  tool: "query_price",
  inputSummary: "query_price StreamBox Plus 45",
});
const verified = await verifyReceipt(receipt);
console.log(
  `RECEIPT decision=${receipt.policyDecision} checkpoint=${receipt.suiCheckpoint} signatureValid=${verified.signatureValid} chainIntact=${verified.chainIntact} hash=${receipt.contentHash.slice(0, 16)}`,
);

const blocked = await attemptSecretRead();
const blockedCheck = await verifyReceipt(blocked);
console.log(
  `BLOCKED_READ decision=${blocked.policyDecision} checkpoint=${blocked.suiCheckpoint ?? "none"} signatureValid=${blockedCheck.signatureValid}`,
);
console.log(`BLOCKED_REASON=${blocked.policyReason}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
