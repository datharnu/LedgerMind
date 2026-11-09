import { z } from "zod";

const envSchema = z.object({
  MEMWAL_PRIVATE_KEY: z.string().min(1).optional(),
  MEMWAL_ACCOUNT_ID: z.string().min(1).optional(),
  MEMWAL_RELAYER_URL: z
    .string()
    .url()
    .default("https://relayer.memory.walrus.xyz"),
  MEMWAL_NAMESPACE: z.string().default("ledgermind"),
  TATUM_API_KEY: z.string().min(1).optional(),
  SUI_PRIVATE_KEY: z.string().min(1).optional(),
  SUI_GRPC_URL: z
    .string()
    .url()
    .default("https://fullnode.mainnet.sui.io:443"),
  SUI_ANCHOR_PACKAGE_ID: z.string().optional(),
  RECEIPT_PROXY_SECRET_HEX: z.string().length(64).optional(),
});

export type AppConfig = z.infer<typeof envSchema>;

export function getConfig(): AppConfig {
  return envSchema.parse({
    MEMWAL_PRIVATE_KEY: process.env.MEMWAL_PRIVATE_KEY,
    MEMWAL_ACCOUNT_ID: process.env.MEMWAL_ACCOUNT_ID,
    MEMWAL_RELAYER_URL: process.env.MEMWAL_RELAYER_URL,
    MEMWAL_NAMESPACE: process.env.MEMWAL_NAMESPACE,
    TATUM_API_KEY: process.env.TATUM_API_KEY,
    SUI_PRIVATE_KEY: process.env.SUI_PRIVATE_KEY,
    SUI_GRPC_URL: process.env.SUI_GRPC_URL,
    SUI_ANCHOR_PACKAGE_ID: process.env.SUI_ANCHOR_PACKAGE_ID,
    RECEIPT_PROXY_SECRET_HEX: process.env.RECEIPT_PROXY_SECRET_HEX,
  });
}

export function hasMemwalCredentials(): boolean {
  const c = getConfig();
  return Boolean(c.MEMWAL_PRIVATE_KEY && c.MEMWAL_ACCOUNT_ID);
}

export function hasTatumCredentials(): boolean {
  return Boolean(getConfig().TATUM_API_KEY);
}

export function hasSuiCredentials(): boolean {
  return Boolean(getConfig().SUI_PRIVATE_KEY);
}

export const SUI_FRAMEWORK_PACKAGE_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000002";
