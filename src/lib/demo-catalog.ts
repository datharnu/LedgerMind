import type { SubscriptionCandidate } from "@/lib/agent";

export const DEFAULT_CANDIDATES: SubscriptionCandidate[] = [
  { id: "n1", name: "CloudNotes Pro", priceMonthly: 12, category: "productivity" },
  { id: "n2", name: "StreamBox Plus", priceMonthly: 45, category: "entertainment" },
  { id: "n3", name: "FitTrack Elite", priceMonthly: 29, category: "health" },
  { id: "n4", name: "DevTools Suite", priceMonthly: 55, category: "developer" },
  { id: "n5", name: "NewsBrief", priceMonthly: 8, category: "news" },
];
