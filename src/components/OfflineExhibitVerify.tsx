"use client";

import { useCallback, useEffect, useState } from "react";
import { verifyReceiptChain } from "@/lib/receipt-crypto";
import type { ExhibitPack, SignedReceipt } from "@/lib/receipt-types";
import { PageLoading } from "@/components/Spinner";
import {
  ReceiptWhyDrawer,
  type ReceiptDetail,
} from "@/components/ReceiptWhyDrawer";

export function OfflineExhibitVerify() {
  const [pack, setPack] = useState<ExhibitPack | null>(null);
  const [receipts, setReceipts] = useState<SignedReceipt[]>([]);
  const [tampered, setTampered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullChainPass, setFullChainPass] = useState<boolean | null>(null);
  const [whyReceipt, setWhyReceipt] = useState<ReceiptDetail | null>(null);

  const runVerify = useCallback(async (list: SignedReceipt[]) => {
    const result = await verifyReceiptChain(list);
    setFullChainPass(result.fullChainPass);
    return result;
  }, []);

  const loadExhibit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTampered(false);
    try {
      const res = await fetch("/samples/exhibit-chain.json");
      if (!res.ok) throw new Error("Could not load exhibit");
      const json = (await res.json()) as ExhibitPack;
      setPack(json);
      setReceipts(json.receipts);
      await runVerify(json.receipts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "load failed");
    } finally {
      setLoading(false);
    }
  }, [runVerify]);

  useEffect(() => {
    void loadExhibit();
  }, [loadExhibit]);

  async function simulateTamper() {
    if (receipts.length === 0) return;
    const next = receipts.map((r) => ({ ...r }));
    const target = next.find((r) => r.sequence === pack?.highlightStep) ?? next.at(-1)!;
    target.contentHash = `${target.contentHash.slice(0, -1)}0`;
    setReceipts(next);
    setTampered(true);
    await runVerify(next);
  }

  const verdict = fullChainPass
    ? "PASS in this tab only."
    : fullChainPass === false
      ? tampered
        ? "FAIL — tampered hash (keep this moment for judges)."
        : "FAIL — invalid chain."
      : undefined;

  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Offline exhibit</h2>
      <p style={{ color: "var(--muted)", maxWidth: "52ch" }}>
        {pack?.label ?? "Committed sample"} — browser crypto, no upload.
      </p>

      <div className="row-actions" style={{ margin: "16px 0" }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => void loadExhibit()}
        >
          Reload exhibit
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          disabled={!receipts.length}
          onClick={() => void simulateTamper()}
        >
          Simulate tamper
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="sheet" style={{ marginTop: 12 }}>
        {loading && <PageLoading label="Loading the exhibit" />}
        {!loading && fullChainPass !== null && (
          <>
            <span
              className={`verdict-badge ${fullChainPass ? "pass" : "fail"}`}
            >
              {fullChainPass ? "PASS" : "FAIL"}
            </span>
            <p style={{ margin: "10px 0 0", color: "var(--muted)" }}>{verdict}</p>
            <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.45 }}>
              {fullChainPass ? (
                <>
                  The committed sample matches the public key in this tab — verified
                  without uploading data.
                </>
              ) : tampered ? (
                <>
                  Changing one content hash broke the chain — tamper detection works
                  entirely in this tab.
                </>
              ) : (
                <>
                  The exhibit file does not verify against the bundled public key.
                </>
              )}
            </p>
          </>
        )}
      </div>

      {!loading && receipts.length > 0 && (
        <ul className="tape-list" style={{ marginTop: 16 }}>
          {receipts.map((r) => (
            <li
              key={r.id}
              className={
                r.sequence === pack?.highlightStep ? "is-highlight" : undefined
              }
            >
              <span>
                <span className="mono">{r.tool}</span> · {r.policyDecision}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setWhyReceipt(r)}
              >
                Why
              </button>
            </li>
          ))}
        </ul>
      )}

      <ReceiptWhyDrawer
        receipt={whyReceipt}
        verdict={verdict}
        onClose={() => setWhyReceipt(null)}
      />
    </section>
  );
}
