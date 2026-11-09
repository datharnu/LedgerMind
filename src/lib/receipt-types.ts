export type ToolName =
  | "query_price"
  | "suggest_subscription"
  | "log_spending"
  | "read_card_details";

export type ReceiptPayload = {
  id: string;
  sequence: number;
  tool: ToolName | string;
  timestamp: string;
  policyDecision: "allow" | "block";
  policyReason: string;
  inputSummary: string;
  previousHash: string | null;
  contentHash: string;
  suiCheckpoint?: string;
};

export type SignedReceipt = ReceiptPayload & {
  signature: string;
  publicKey: string;
};

export type ExhibitPack = {
  label: string;
  recordedAt: string;
  highlightStep: number;
  receipts: SignedReceipt[];
};
