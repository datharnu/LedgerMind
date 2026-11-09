export type ToolName =
  | "query_price"
  | "suggest_subscription"
  | "read_card_details"
  | "log_spending";

export type PolicyDecision = "allow" | "block";

const BLOCKED: ReadonlySet<ToolName> = new Set(["read_card_details"]);

export function evaluatePolicy(tool: ToolName): {
  decision: PolicyDecision;
  reason: string;
} {
  if (BLOCKED.has(tool)) {
    return {
      decision: "block",
      reason: "Policy forbids reading card or PAN data; only aggregate spend rules apply.",
    };
  }
  return {
    decision: "allow",
    reason: "Tool is on the allow list for this agent.",
  };
}
