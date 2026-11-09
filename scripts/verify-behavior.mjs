import "dotenv/config";

process.env.MEMWAL_NAMESPACE = "ledgermind-verify";

const { getSuggestions } = await import("../src/lib/agent.ts");
const { MemWal } = await import("@mysten-incubation/memwal");

function fail(reason) {
  console.log(`FAIL: ${reason}`);
  process.exit(1);
}

const key = process.env.MEMWAL_PRIVATE_KEY;
const accountId = process.env.MEMWAL_ACCOUNT_ID;
const serverUrl = process.env.MEMWAL_RELAYER_URL;
if (!key || !accountId) fail("MEMWAL credentials missing");
if (serverUrl !== "https://relayer.memory.walrus.xyz") {
  fail("relayer is not Mainnet");
}

const candidate = {
  id: "verify-cny-45",
  name: "CNY Monthly",
  priceMonthly: 45,
  currency: "CNY",
  category: "subscription",
};

function isRecommended(result) {
  return result.suggestions.some(
    (s) => s.id === candidate.id && s.priceMonthly === 45,
  );
}

function referencesMemory(result, blobId) {
  return (result.memoriesUsed ?? []).some(
    (m) =>
      m.blobId === blobId ||
      (typeof m.text === "string" &&
        m.text.includes("rejected subscription at 45 CNY")),
  );
}

const before = await getSuggestions([candidate]);
console.log("BEFORE:");
console.log(JSON.stringify(before, null, 2));

if (!isRecommended(before)) {
  fail("45 CNY subscription was not recommended with no matching memory");
}

const memwal = MemWal.create({
  key,
  accountId,
  serverUrl,
  namespace: "ledgermind-verify",
});

let stored;
try {
  stored = await memwal.rememberAndWait(
    "verify: user rejected subscription at 45 CNY because too expensive",
    { timeoutMs: 120_000 },
  );
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}

if (!stored.blob_id) fail("rememberAndWait returned empty blob_id");
console.log(`memory_blob_id=${stored.blob_id}`);

const after = await getSuggestions([candidate]);
console.log("AFTER:");
console.log(JSON.stringify(after, null, 2));

const identical = JSON.stringify(before) === JSON.stringify(after);
const stillRecommended = isRecommended(after);
const referenced = referencesMemory(after, stored.blob_id);

if (identical) {
  fail("behavior identical");
}
if (stillRecommended && !referenced) {
  fail("still recommended and response does not reference the memory");
}

console.log(
  `PASS: before_recommended=true after_recommended=${stillRecommended} references_memory=${referenced}`,
);
