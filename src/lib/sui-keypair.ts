import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getConfig, hasSuiCredentials } from "@/lib/config";

export function getSuiSigner(): Ed25519Keypair {
  if (!hasSuiCredentials()) {
    throw new Error("SUI_PRIVATE_KEY is required for onchain anchoring");
  }
  const raw = getConfig().SUI_PRIVATE_KEY!.trim();
  if (raw.startsWith("suiprivkey")) {
    return Ed25519Keypair.fromSecretKey(raw);
  }
  const hex = raw.startsWith("0x") ? raw.slice(2) : raw;
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      "SUI_PRIVATE_KEY must be 32-byte hex (64 chars) or suiprivkey1… bech32",
    );
  }
  return Ed25519Keypair.fromSecretKey(new Uint8Array(Buffer.from(hex, "hex")));
}
