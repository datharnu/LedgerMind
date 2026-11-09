import { getConfig, hasTatumCredentials } from "@/lib/config";

const TATUM_GRAPHQL = "https://sui-mainnet.gateway.tatum.io/graphql";
const CACHE_MS = 60_000;

type CheckpointCache = { sequenceNumber: string; fetchedAt: number };

let checkpointCache: CheckpointCache | null = null;

const CHECKPOINT_QUERY = `
  query LatestCheckpoint {
    checkpoint {
      sequenceNumber
    }
  }
`;

export type TatumCheckpoint = {
  sequenceNumber: string;
  fetchedAt: string;
  source: "tatum-graphql";
};

export async function fetchLatestCheckpoint(): Promise<TatumCheckpoint> {
  if (
    checkpointCache &&
    Date.now() - checkpointCache.fetchedAt < CACHE_MS
  ) {
    return {
      sequenceNumber: checkpointCache.sequenceNumber,
      fetchedAt: new Date(checkpointCache.fetchedAt).toISOString(),
      source: "tatum-graphql",
    };
  }

  if (!hasTatumCredentials()) {
    throw new Error("TATUM_API_KEY is required");
  }

  const apiKey = getConfig().TATUM_API_KEY!;

  const res = await fetch(TATUM_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ query: CHECKPOINT_QUERY }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tatum GraphQL ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    data?: { checkpoint?: { sequenceNumber?: string | number } };
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  const seq = json.data?.checkpoint?.sequenceNumber;
  if (seq === undefined || seq === null) {
    throw new Error("Tatum GraphQL: missing checkpoint.sequenceNumber");
  }

  const sequenceNumber = String(seq);
  checkpointCache = { sequenceNumber, fetchedAt: Date.now() };

  return {
    sequenceNumber,
    fetchedAt: new Date(checkpointCache.fetchedAt).toISOString(),
    source: "tatum-graphql",
  };
}
