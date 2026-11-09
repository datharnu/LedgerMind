import {
  formatSpendingMemory,
  recallSpendingRules,
  rememberFact,
} from "@/lib/memwal-client";
import { issueReceipt } from "@/lib/receipt";

export type SubscriptionCandidate = {
  id: string;
  name: string;
  priceMonthly: number;
  currency?: string;
  category: string;
};

export type SuggestionResult = {
  suggestions: SubscriptionCandidate[];
  filteredOut: { candidate: SubscriptionCandidate; reason: string }[];
  memoriesUsed: { blobId?: string; text: string; distance?: number }[];
};

const TOO_EXPENSIVE =
  /too expensive|over budget|price cap|max spend|limit/i;

/** Immediate desk state (recall can lag behind rememberAndWait). */
const sessionDecisions = new Map<
  string,
  { action: "accepted" | "rejected"; reason?: string }
>();

export function resetSessionDecisionsForTests() {
  sessionDecisions.clear();
}

function parseAcceptedNames(texts: string[]): Set<string> {
  const acceptedNames = new Set<string>();
  for (const text of texts) {
    const m = text.match(/accepted subscription ([^]+?) at /i);
    if (m) acceptedNames.add(m[1].trim().toLowerCase());
  }
  return acceptedNames;
}

function parseRejectionsFromMemories(texts: string[]): {
  maxRejectedPrice?: number;
  rejectedNames: Set<string>;
} {
  let maxRejectedPrice: number | undefined;
  const rejectedNames = new Set<string>();

  for (const text of texts) {
    const m = text.match(
      /rejected subscription ([^]+?) at \D*(\d+(?:\.\d+)?)\/month/i,
    );
    if (m) {
      rejectedNames.add(m[1].trim().toLowerCase());
      const price = Number(m[2]);
      const reason = text.match(/because:\s*(.+)/i)?.[1] ?? "";
      if (TOO_EXPENSIVE.test(reason) || TOO_EXPENSIVE.test(text)) {
        maxRejectedPrice =
          maxRejectedPrice === undefined
            ? price
            : Math.min(maxRejectedPrice, price);
      }
    }
  }

  return { maxRejectedPrice, rejectedNames };
}

export function filterCandidatesLocal(
  candidates: SubscriptionCandidate[],
  memoryTexts: string[],
): SuggestionResult {
  const { maxRejectedPrice, rejectedNames } =
    parseRejectionsFromMemories(memoryTexts);

  const filteredOut: SuggestionResult["filteredOut"] = [];
  const suggestions: SubscriptionCandidate[] = [];

  for (const c of candidates) {
    if (rejectedNames.has(c.name.toLowerCase())) {
      filteredOut.push({
        candidate: c,
        reason: `Previously rejected: ${c.name}`,
      });
      continue;
    }
    if (
      maxRejectedPrice !== undefined &&
      c.priceMonthly > maxRejectedPrice &&
      memoryTexts.some((t) => TOO_EXPENSIVE.test(t))
    ) {
      filteredOut.push({
        candidate: c,
        reason: `Above learned cap (~${maxRejectedPrice}/mo from Walrus memories)`,
      });
      continue;
    }
    suggestions.push(c);
  }

  return {
    suggestions,
    filteredOut,
    memoriesUsed: memoryTexts.map((text) => ({ text })),
  };
}

function applySessionDecisions(
  candidates: SubscriptionCandidate[],
  base: SuggestionResult,
): SuggestionResult {
  if (sessionDecisions.size === 0) return base;

  const filteredOut = [...base.filteredOut];
  const filteredIds = new Set(filteredOut.map((f) => f.candidate.id));
  const suggestions: SubscriptionCandidate[] = [];

  for (const c of candidates) {
    const session = sessionDecisions.get(c.id);
    if (session?.action === "accepted") continue;
    if (session?.action === "rejected") {
      if (!filteredIds.has(c.id)) {
        filteredOut.push({
          candidate: c,
          reason: session.reason
            ? `Rejected: ${session.reason}`
            : "Rejected on your desk",
        });
        filteredIds.add(c.id);
      }
      continue;
    }
    if (filteredIds.has(c.id)) continue;
    if (base.suggestions.some((s) => s.id === c.id)) suggestions.push(c);
  }

  return { ...base, suggestions, filteredOut };
}

export async function getSuggestions(
  candidates: SubscriptionCandidate[],
): Promise<SuggestionResult> {
  await issueReceipt({
    tool: "suggest_subscription",
    inputSummary: `rank ${candidates.length} subscription candidates`,
  });

  try {
    const recalled = await recallSpendingRules(8);
    const texts = recalled.results.map((r) => r.text);
    const result = filterCandidatesLocal(candidates, texts);
    result.memoriesUsed = recalled.results.map((r) => ({
      blobId: r.blob_id,
      text: r.text,
      distance: r.distance,
    }));
    return applySessionDecisions(candidates, result);
  } catch {
    return applySessionDecisions(
      candidates,
      filterCandidatesLocal(candidates, []),
    );
  }
}

export async function recordFeedback(input: {
  action: "accepted" | "rejected";
  candidate: SubscriptionCandidate;
  reason?: string;
}) {
  const memoryText = formatSpendingMemory({
    action: input.action,
    name: input.candidate.name,
    priceMonthly: input.candidate.priceMonthly,
    currency: input.candidate.currency ?? "USD",
    category: input.candidate.category,
    reason: input.reason,
  });

  sessionDecisions.set(input.candidate.id, {
    action: input.action,
    reason: input.reason,
  });

  const memory = await rememberFact(memoryText);

  await issueReceipt({
    tool: "log_spending",
    inputSummary: `${input.action} ${input.candidate.name} @ ${input.candidate.priceMonthly}`,
  });

  return { memory, memoryText };
}

export async function queryPrice(product: string, price: number) {
  const receipt = await issueReceipt({
    tool: "query_price",
    inputSummary: `query_price ${product} ${price}`,
  });
  return { product, price, receipt };
}

export async function attemptSecretRead() {
  const receipt = await issueReceipt({
    tool: "read_card_details",
    inputSummary: "attempt read_card_details",
    attachCheckpoint: false,
  });
  return receipt;
}

/** Deterministic filter for tests without Walrus */
export function suggestWithMemories(
  candidates: SubscriptionCandidate[],
  memories: string[],
): SuggestionResult {
  return filterCandidatesLocal(candidates, memories);
}
