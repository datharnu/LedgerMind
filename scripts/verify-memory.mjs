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

if (!key || !accountId) {
  fail("MEMWAL_PRIVATE_KEY or MEMWAL_ACCOUNT_ID missing");
}
if (!serverUrl || /staging|dev/i.test(serverUrl)) {
  fail("MEMWAL_RELAYER_URL is not Mainnet");
}
if (serverUrl !== "https://relayer.memory.walrus.xyz") {
  fail("MEMWAL_RELAYER_URL is not https://relayer.memory.walrus.xyz");
}

const memwal = MemWal.create({
  key,
  accountId,
  serverUrl,
  namespace,
});

try {
  const health = await memwal.health();
  const healthOk =
    health &&
    (health.ok === true ||
      health.status === "ok" ||
      health.status === "healthy");
  if (!healthOk) {
    fail(`health not ok (status=${health?.status ?? "missing"})`);
  }

  const result = await memwal.rememberAndWait(
    "verify: user rejected subscription at 45 CNY because too expensive",
    { timeoutMs: 120_000 },
  );

  let status = result.status;
  if (status == null && result.job_id) {
    const job = await memwal.getRememberStatus(result.job_id);
    status = job.status;
  }

  if (!result.blob_id) {
    fail(`empty blob_id (status=${status ?? "missing"})`);
  }
  if (status !== "done") {
    fail(`status=${status ?? "missing"} blob_id=${result.blob_id}`);
  }

  console.log(`PASS: blob_id=${result.blob_id}`);
  console.log(`status=${status}`);
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}
