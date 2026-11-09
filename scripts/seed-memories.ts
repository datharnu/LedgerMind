import "dotenv/config";
import { rememberFact, formatSpendingMemory } from "../src/lib/memwal-client";

const SEED_FACTS = [
  { name: "StreamBox Plus", price: 45, action: "rejected" as const, reason: "too expensive" },
  { name: "DevTools Suite", price: 55, action: "rejected" as const, reason: "over budget" },
  { name: "NewsBrief", price: 8, action: "accepted" as const },
  { name: "CloudNotes Pro", price: 12, action: "accepted" as const },
  { name: "FitTrack Elite", price: 29, action: "rejected" as const, reason: "too expensive" },
  { name: "PodcastHub", price: 42, action: "rejected" as const, reason: "price cap USD40" },
  { name: "PhotoAI", price: 38, action: "accepted" as const },
  { name: "LangTutor", price: 33, action: "rejected" as const, reason: "too expensive" },
  { name: "VPN Shield", price: 9, action: "accepted" as const },
  { name: "GamePass Ultra", price: 48, action: "rejected" as const, reason: "too expensive" },
];

async function main() {
  const blobIds: string[] = [];
  for (const row of SEED_FACTS) {
    const text = formatSpendingMemory({
      action: row.action,
      name: row.name,
      priceMonthly: row.price,
      category: "seed",
      reason: row.reason,
    });
    const { blobId } = await rememberFact(text);
    blobIds.push(blobId);
    console.log(blobId, text);
  }
  console.log(`\nWrote ${blobIds.length} memories to Walrus Mainnet.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
