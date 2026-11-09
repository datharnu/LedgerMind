import "dotenv/config";

const stamp = Date.now();
const namespace = `ledgermind-e2e-${stamp}`;
process.env.MEMWAL_NAMESPACE = namespace;

const { getSuggestions, recordFeedback, resetSessionDecisionsForTests } =
  await import("../src/lib/agent.ts");
const { listReceipts, verifyReceipt } = await import("../src/lib/receipt.ts");

const rows = [];

function record(step, status, evidence) {
  rows.push({ step, status, evidence });
  console.log(`${status}\t${step}\t${evidence}`);
}

const candidate = {
  id: `e2e-${stamp}`,
  name: `E2E Probe ${stamp}`,
  priceMonthly: 41,
  currency: "USD",
  category: "test",
};

record(
  "1 reset",
  "PASS",
  `fresh namespace ${namespace}; memwal has no wipe, so this probe starts with no memories`,
);

let wrote = null;
try {
  const before = await getSuggestions([candidate]);
  const recommended = before.suggestions.some((s) => s.id === candidate.id);
  record(
    "2 before reject",
    recommended ? "PASS" : "FAIL",
    recommended
      ? "probe recommended"
      : `not recommended; filtered=${before.filteredOut.map((f) => f.reason).join(" | ") || "none"}`,
  );
} catch (err) {
  record("2 before reject", "FAIL", err instanceof Error ? err.message : String(err));
}

try {
  const saved = await recordFeedback({
    action: "rejected",
    candidate,
    reason: "too expensive",
  });
  wrote = saved;
  record(
    "3 walrus write",
    saved.memory?.blobId ? "PASS" : "FAIL",
    saved.memory?.blobId
      ? `blob_id=${saved.memory.blobId}`
      : "rememberAndWait returned no blob_id",
  );
} catch (err) {
  record("3 walrus write", "FAIL", err instanceof Error ? err.message : String(err));
}

try {
  resetSessionDecisionsForTests();
  const after = await getSuggestions([candidate]);
  const hit = after.filteredOut.find((f) => f.candidate.id === candidate.id);
  record(
    "4 suggestion filtered",
    hit ? "PASS" : "FAIL",
    hit
      ? hit.reason
      : `still suggested; memories=${after.memoriesUsed.length}`,
  );
} catch (err) {
  record(
    "4 suggestion filtered",
    "FAIL",
    err instanceof Error ? err.message : String(err),
  );
}

try {
  const receipt = [...listReceipts()]
    .reverse()
    .find((r) => r.tool === "log_spending" && r.inputSummary.includes(candidate.name));
  if (!receipt) {
    record("5 receipt signature", "FAIL", "no log_spending receipt for this probe");
    record("5 hash link", "FAIL", "no receipt");
    record("6 tatum checkpoint", "FAIL", "no receipt");
  } else {
    const checked = await verifyReceipt(receipt);
    record(
      "5 receipt signature",
      checked.signatureValid ? "PASS" : "FAIL",
      checked.signatureValid
        ? `id=${receipt.id} sequence=${receipt.sequence}`
        : checked.errors.join("; ") || "signature invalid",
    );
    record(
      "5 hash link",
      checked.chainIntact ? "PASS" : "FAIL",
      checked.chainIntact
        ? `previousHash=${receipt.previousHash ? receipt.previousHash.slice(0, 12) : "genesis"}`
        : checked.errors.join("; ") || "chain break",
    );
    const checkpoint = receipt.suiCheckpoint ?? "";
    record(
      "6 tatum checkpoint stored",
      /^\d+$/.test(checkpoint) ? "PASS" : "FAIL",
      /^\d+$/.test(checkpoint)
        ? `suiCheckpoint=${checkpoint} on receipt ${receipt.id}`
        : `suiCheckpoint missing on receipt ${receipt.id}`,
    );
  }
} catch (err) {
  record("5 receipt", "FAIL", err instanceof Error ? err.message : String(err));
}

const failed = rows.some((r) => r.status === "FAIL");
console.log("---");
console.log(failed ? "CHECKBOX 8 FAIL" : "CHECKBOX 8 PASS");
if (wrote?.memoryText) console.log(`memory_text=${wrote.memoryText}`);
process.exit(failed ? 1 : 0);
