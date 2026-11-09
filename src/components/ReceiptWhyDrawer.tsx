"use client";

import { useEffect, useRef } from "react";

export type ReceiptDetail = {
  id: string;
  sequence: number;
  tool: string;
  timestamp: string;
  policyDecision: "allow" | "block" | string;
  policyReason: string;
  inputSummary: string;
  previousHash: string | null;
  contentHash: string;
  suiCheckpoint?: string;
  signatureValid?: boolean;
  chainIntact?: boolean;
};

const DECISION: Record<string, { label: string; tone: "ok" | "bad" }> = {
  allow: { label: "Allowed", tone: "ok" },
  block: { label: "Blocked", tone: "bad" },
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ReceiptWhyDrawer({
  receipt,
  verdict,
  onClose,
}: {
  receipt: ReceiptDetail | null;
  /** One-line chain verdict for context, e.g. full chain PASS */
  verdict?: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const open = receipt !== null;

  useEffect(() => {
    if (!open) return;
    returnFocus.current ??= document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;
    returnFocus.current?.focus();
    returnFocus.current = null;
  }, [open]);

  if (!receipt) return null;

  const decision = DECISION[receipt.policyDecision] ?? {
    label: receipt.policyDecision,
    tone: "bad" as const,
  };

  const reasons: string[] = [
    receipt.policyReason,
    receipt.policyDecision === "block"
      ? "The proxy recorded this attempt before any sensitive data was returned."
      : receipt.suiCheckpoint
        ? `Tatum returned Sui checkpoint #${receipt.suiCheckpoint} on this allow path.`
        : "Allow path without checkpoint (Tatum not configured or fetch failed).",
    receipt.previousHash
      ? `Hash-linked to the previous receipt (${receipt.previousHash.slice(0, 12)}…).`
      : "Genesis receipt in this session.",
  ];

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="why-title"
      >
        <div className="drawer-handle" aria-hidden="true" />
        <header className="drawer-head">
          <p className="kicker">Step {pad(receipt.sequence)} · {receipt.tool}</p>
          <h2 id="why-title">Why this receipt</h2>
          <button
            ref={closeRef}
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className={`verdict-pill tone-${decision.tone}`}>{decision.label}</div>

        <dl className="readout">
          <div>
            <dt>Input</dt>
            <dd className="mono">{receipt.inputSummary}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{new Date(receipt.timestamp).toLocaleString()}</dd>
          </div>
          <div>
            <dt>Content hash</dt>
            <dd className="mono">{receipt.contentHash.slice(0, 24)}…</dd>
          </div>
        </dl>

        <h3 className="drawer-sub">Reasons</h3>
        <ol className="why-list">
          {reasons.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>

        {(receipt.signatureValid !== undefined ||
          receipt.chainIntact !== undefined) && (
          <div className="panel panel-inset">
            <h3 className="drawer-sub">Verification</h3>
            <p className="muted">
              Signature{" "}
              <span
                className={
                  receipt.signatureValid ? "text-ok" : "text-bad"
                }
              >
                {receipt.signatureValid ? "valid" : "invalid"}
              </span>
              {" · "}
              Chain link{" "}
              <span
                className={receipt.chainIntact ? "text-ok" : "text-bad"}
              >
                {receipt.chainIntact ? "intact" : "broken"}
              </span>
            </p>
          </div>
        )}

        <footer className="drawer-foot muted">
          {verdict ? <p>{verdict}</p> : null}
          <p className="mono">id {receipt.id}</p>
        </footer>
      </section>
    </div>
  );
}
