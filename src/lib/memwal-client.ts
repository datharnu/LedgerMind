import { MemWal } from "@mysten-incubation/memwal";
import { getConfig, hasMemwalCredentials } from "@/lib/config";

let client: MemWal | null = null;
let clientNamespace: string | null = null;

export function resetMemwalClient() {
  client = null;
  clientNamespace = null;
}

export function getMemwal(): MemWal {
  if (!hasMemwalCredentials()) {
    throw new Error(
      "MEMWAL_PRIVATE_KEY and MEMWAL_ACCOUNT_ID are required for Walrus Memory",
    );
  }
  const cfg = getConfig();
  if (!client || clientNamespace !== cfg.MEMWAL_NAMESPACE) {
    client = MemWal.create({
      key: cfg.MEMWAL_PRIVATE_KEY!,
      accountId: cfg.MEMWAL_ACCOUNT_ID!,
      serverUrl: cfg.MEMWAL_RELAYER_URL,
      namespace: cfg.MEMWAL_NAMESPACE,
    });
    clientNamespace = cfg.MEMWAL_NAMESPACE;
  }
  return client;
}

export function formatSpendingMemory(input: {
  action: "accepted" | "rejected";
  name: string;
  priceMonthly: number;
  currency?: string;
  category?: string;
  reason?: string;
}): string {
  const currency = input.currency ?? "USD";
  const category = input.category ? ` category ${input.category}` : "";
  const reason =
    input.action === "rejected" && input.reason
      ? ` because: ${input.reason}`
      : "";
  return `User ${input.action} subscription ${input.name} at ${currency}${input.priceMonthly}/month${category}${reason}.`;
}

export async function rememberFact(text: string) {
  const memwal = getMemwal();
  const namespace = getConfig().MEMWAL_NAMESPACE;
  const stored = await memwal.rememberAndWait(text, namespace, {
    timeoutMs: 60_000,
  });
  return {
    blobId: stored.blob_id,
    jobId: stored.job_id,
    text,
  };
}

export async function recallSpendingRules(limit = 5) {
  const memwal = getMemwal();
  const namespace = getConfig().MEMWAL_NAMESPACE;
  return memwal.recall({
    query: "user spending limits rejected subscriptions price caps",
    limit,
    maxDistance: 0.75,
    namespace,
  });
}

export async function memwalHealth() {
  const memwal = getMemwal();
  return memwal.health();
}
