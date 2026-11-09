const STEPS = [
  {
    n: 1,
    action: "Suggest StreamBox Plus at $45/mo",
    outcome: "ALLOW",
    note: "query_price · receipt + Tatum checkpoint when configured",
  },
  {
    n: 2,
    action: 'You reject: "too expensive"',
    outcome: "MEMORY",
    note: "Walrus Mainnet rememberAndWait → blob_id",
  },
  {
    n: 3,
    action: "Next refresh",
    outcome: "LEARNED",
    note: "recall filters StreamBox · reason on screen",
  },
  {
    n: 4,
    action: "Agent tries read_card_details",
    outcome: "BLOCK",
    note: "Policy refuses · still signed on receipt chain",
  },
] as const;

export function CanonicalLoop({ compact }: { compact?: boolean }) {
  return (
    <div className={`canonical${compact ? " canonical-compact" : ""}`}>
      <p className="canonical-kicker">Demo sequence</p>
      <ol className="canonical-steps">
        {STEPS.map((s) => (
          <li key={s.n}>
            <span className="canonical-n">{s.n}</span>
            <div className="canonical-body">
              <p className="canonical-action">{s.action}</p>
              <p className="canonical-note">{s.note}</p>
            </div>
            <span className={`canonical-pill pill-${s.outcome.toLowerCase()}`}>
              {s.outcome}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
