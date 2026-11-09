import "dotenv/config";
import { MemWal } from "@mysten-incubation/memwal";

function fail(reason) {
  console.log(`FAIL: ${reason}`);
  process.exit(1);
}

const key = process.env.MEMWAL_PRIVATE_KEY;
const accountId = process.env.MEMWAL_ACCOUNT_ID;
const serverUrl = process.env.MEMWAL_RELAYER_URL;
const namespace = process.env.MEMWAL_NAMESPACE || "ledgermind";

if (!key || !accountId) fail("MEMWAL credentials missing");
if (serverUrl !== "https://relayer.memory.walrus.xyz") {
  fail("relayer is not Mainnet");
}

const memwal = MemWal.create({ key, accountId, serverUrl, namespace });

try {
  const recalled = await memwal.recall({
    query: "user spending preference and rejected subscriptions",
    limit: 50,
  });
  const results = recalled.results ?? [];
  const withBlob = results.filter(
    (r) => typeof r.blob_id === "string" && r.blob_id.length > 0,
  );
  const missing = results.length - withBlob.length;
  const ids = withBlob.map((r) => r.blob_id);

  console.log(`count=${withBlob.length}`);
  console.log(`total=${recalled.total ?? results.length}`);
  console.log("blob_ids:");
  for (const id of ids) console.log(id);

  if (missing > 0) {
    fail(`${missing} recalled entries lack blob_id`);
  }
  if (withBlob.length < 10) {
    fail(`count ${withBlob.length} < 10`);
  }
  console.log(`PASS: count=${withBlob.length}`);
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}
