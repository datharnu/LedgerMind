import "dotenv/config";

function fail(reason) {
  console.log(`FAIL: ${reason}`);
  process.exit(1);
}

const apiKey = process.env.TATUM_API_KEY;
if (!apiKey) fail("TATUM_API_KEY missing");

const url = "https://sui-mainnet.gateway.tatum.io/graphql";

try {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query: "{ checkpoint { sequenceNumber } }",
    }),
  });

  const text = await res.text();
  if (res.status !== 200) {
    fail(`HTTP ${res.status} ${text.slice(0, 300)}`);
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    fail(`non-JSON body ${text.slice(0, 300)}`);
  }

  const seq = json?.data?.checkpoint?.sequenceNumber;
  const numeric =
    typeof seq === "number"
      ? Number.isFinite(seq)
      : typeof seq === "string" && /^\d+$/.test(seq);
  if (!numeric) {
    fail(`missing numeric checkpoint.sequenceNumber body=${text.slice(0, 300)}`);
  }

  console.log(`PASS: checkpoint=${seq}`);
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}
