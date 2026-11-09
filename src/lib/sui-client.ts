import { SuiGrpcClient } from "@mysten/sui/grpc";

// Anchor gas is Sui testnet. Walrus Memory and Tatum GraphQL stay on Mainnet.
const SUI_TESTNET_GRPC_URL = "https://fullnode.testnet.sui.io:443";

let client: SuiGrpcClient | null = null;

export function getSuiGrpcClient(): SuiGrpcClient {
  if (!client) {
    client = new SuiGrpcClient({
      network: "testnet",
      baseUrl: SUI_TESTNET_GRPC_URL,
    });
  }
  return client;
}
