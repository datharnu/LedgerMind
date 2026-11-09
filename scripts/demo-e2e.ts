/**
 * Run with .env configured:
 * npm run demo:e2e
 */
import "dotenv/config";
import { getSuggestions, recordFeedback } from "../src/lib/agent";
import { DEFAULT_CANDIDATES } from "../src/lib/demo-catalog";
import { verifyFullChain } from "../src/lib/receipt";
import { attemptSecretRead } from "../src/lib/agent";

async function main() {
  const before = await getSuggestions(DEFAULT_CANDIDATES);
  console.log(
    "Before:",
    before.suggestions.map((s) => s.name),
    "filtered:",
    before.filteredOut.map((f) => f.candidate.name),
  );

  const stream = DEFAULT_CANDIDATES.find((c) => c.name === "StreamBox Plus")!;
  await recordFeedback({
    action: "rejected",
    candidate: stream,
    reason: "too expensive",
  });

  const after = await getSuggestions(DEFAULT_CANDIDATES);
  console.log(
    "After reject:",
    after.suggestions.map((s) => s.name),
    "filtered:",
    after.filteredOut.map((f) => f.candidate.name),
  );

  const blocked = await attemptSecretRead();
  console.log("Blocked read receipt:", blocked.policyDecision);

  console.log("Chain ok:", await verifyFullChain());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
