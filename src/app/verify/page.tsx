"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PageLoading } from "@/components/Spinner";
import { OfflineExhibitVerify } from "@/components/OfflineExhibitVerify";
import {
  ReceiptWhyDrawer,
  type ReceiptDetail,
} from "@/components/ReceiptWhyDrawer";
import "./verify.css";

type ChainPayload = {
  publicKey: string;
  receiptCount: number;
  fullChainPass: boolean;
  receipts: ReceiptDetail[];
  stepResults: {
    id: string;
    sequence: number;
    tool: string;
    policyDecision: string;
    signatureValid: boolean;
    chainIntact: boolean;
    errors: string[];
  }[];
};

type SpotCheck = {
  id: string;
  receipt: ReceiptDetail;
  signatureValid: boolean;
  chainIntact: boolean;
  errors: string[];
};

export default function VerifyPage() {
  const [chain, setChain] = useState<ChainPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [singleId, setSingleId] = useState("");
  const [spotCheck, setSpotCheck] = useState<SpotCheck | null>(null);
  const [whyReceipt, setWhyReceipt] = useState<ReceiptDetail | null>(null);

  const loadChain = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/receipts/verify-chain", {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "verify-chain failed");
      const stepById = new Map(
        (json.stepResults as ChainPayload["stepResults"]).map((s) => [s.id, s]),
      );
      const receipts = (json.receipts as ReceiptDetail[]).map((r) => {
        const step = stepById.get(r.id);
        return {
          ...r,
          signatureValid: step?.signatureValid,
          chainIntact: step?.chainIntact,
        };
      });
      setChain({ ...json, receipts });
    } catch (e) {
      setError(e instanceof Error ? e.message : "load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChain();
  }, [loadChain]);

  const verifyId = useCallback(
    async (rawId: string) => {
      setError(null);
      setSpotCheck(null);
      const id = rawId.trim();
      if (!id) {
        setError("Paste a receipt UUID from the tape or your desk.");
        return;
      }
      setSingleId(id);

      const onChain = chain?.receipts.find((r) => r.id === id);
      const step = chain?.stepResults.find((s) => s.id === id);
      if (onChain && step) {
        setSpotCheck({
          id,
          receipt: onChain,
          signatureValid: step.signatureValid,
          chainIntact: step.chainIntact,
          errors: step.errors,
        });
        return;
      }

      try {
        const res = await fetch("/api/receipts/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setSpotCheck({
          id,
          receipt: json.receipt as ReceiptDetail,
          signatureValid: Boolean(json.verification?.signatureValid),
          chainIntact: Boolean(json.verification?.chainIntact),
          errors: (json.verification?.errors as string[]) ?? [],
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "verify failed");
      }
    },
    [chain],
  );

  const verifyOne = useCallback(() => verifyId(singleId), [singleId, verifyId]);

  const verdict = chain
    ? chain.fullChainPass
      ? `PASS — ${chain.receiptCount} receipts; signatures and links intact.`
      : `FAIL — tamper or break detected.`
    : undefined;

  return (
    <div className="page-shell">
      <SiteHeader />
      <div className="verify-page wrap page-fill" id="main">
        <VerifyBody
          loading={loading}
          error={error}
          chain={chain}
          verdict={verdict}
          loadChain={loadChain}
          setWhyReceipt={setWhyReceipt}
          singleId={singleId}
          setSingleId={setSingleId}
          verifyOne={verifyOne}
          verifyId={verifyId}
          spotCheck={spotCheck}
          onPickFromTape={(id) => setSingleId(id)}
        >
          <OfflineExhibitVerify />
        </VerifyBody>
        <ReceiptWhyDrawer
          receipt={whyReceipt}
          verdict={verdict}
          onClose={() => setWhyReceipt(null)}
        />
      </div>
    </div>
  );
}

function VerifyBody(props: {
  loading: boolean;
  error: string | null;
  chain: ChainPayload | null;
  verdict: string | undefined;
  loadChain: () => void;
  setWhyReceipt: (r: ReceiptDetail) => void;
  singleId: string;
  setSingleId: (v: string) => void;
  verifyOne: () => void;
  verifyId: (id: string) => void;
  spotCheck: SpotCheck | null;
  onPickFromTape: (id: string) => void;
  children?: ReactNode;
}) {
  const {
    loading,
    error,
    chain,
    verdict,
    loadChain,
    setWhyReceipt,
    singleId,
    setSingleId,
    verifyOne,
    verifyId,
    spotCheck,
    onPickFromTape,
    children,
  } = props;

  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!spotCheck) return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [spotCheck]);

  const spotPass = spotCheck
    ? spotCheck.signatureValid && spotCheck.chainIntact
    : null;

  return (
    <div className="page-scroll verify-scroll">
      <div className="verify-intro">
        <p className="eyebrow">Audit trail</p>
        <h1>Verify the signed receipt chain.</h1>
        <p>
          The verdict and the tape live here — paste one receipt UUID to jump to
          that step, or tap a row on the tape.
        </p>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="sheet verdict-card">
        {loading && <PageLoading label="Checking the receipt chain" />}
        {!loading && chain && (
          <>
            <p className="eyebrow" style={{ marginBottom: 8 }}>
              Full chain
            </p>
            <span
              className={`verdict-badge ${chain.fullChainPass ? "pass" : "fail"}`}
            >
              {chain.fullChainPass ? "PASS" : "FAIL"}
            </span>
            <p className="verdict-line">{verdict}</p>
            <p className="verdict-meta mono">
              signer {chain.publicKey.slice(0, 16)}… · {chain.receiptCount} steps
            </p>
            {chain.fullChainPass ? (
              <p className="verdict-hint">
                Every signature verifies and each step links to the previous hash.
              </p>
            ) : (
              <p className="verdict-hint">
                A signature or hash link failed — locate the broken step on the tape
                below.
              </p>
            )}

            <div className="verify-spot">
              <p className="eyebrow">One receipt</p>
              <p className="verdict-hint" style={{ marginTop: 4 }}>
                Paste a UUID from your desk or tap Verify on a tape row — result
                shows here and highlights on the tape.
              </p>
              <div className="verify-spot-row">
                <input
                  className="verify-input"
                  placeholder="Receipt UUID"
                  value={singleId}
                  onChange={(e) => {
                    setSingleId(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void verifyOne();
                  }}
                  aria-label="Receipt UUID"
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => void verifyOne()}
                >
                  Verify
                </button>
              </div>

              {spotCheck && (
                <div className="verify-spot-result" ref={resultRef} aria-live="polite">
                  <span
                    className={`verdict-badge verdict-badge-sm ${spotPass ? "pass" : "fail"}`}
                  >
                    {spotPass ? "PASS" : "FAIL"}
                  </span>
                  <p className="verdict-line" style={{ marginTop: 10 }}>
                    {spotPass
                      ? `Step ${String(spotCheck.receipt.sequence).padStart(2, "0")} — signature and hash link OK.`
                      : `Step ${String(spotCheck.receipt.sequence).padStart(2, "0")} — tamper or break detected.`}
                  </p>
                  <ul className="verdict-means">
                    <li>
                      <span className="means-signal">Tool</span>
                      <p className="means-body mono">{spotCheck.receipt.tool}</p>
                    </li>
                    <li>
                      <span className="means-signal">Signature</span>
                      <p className="means-body">
                        {spotCheck.signatureValid ? "Valid" : "Invalid or tampered"}
                      </p>
                    </li>
                    <li>
                      <span className="means-signal">Hash link</span>
                      <p className="means-body">
                        {spotCheck.chainIntact
                          ? "Links to previous receipt"
                          : "Broken or not in this session chain"}
                      </p>
                    </li>
                    {spotCheck.errors.length > 0 && (
                      <li>
                        <span className="means-signal">Details</span>
                        <p className="means-body">{spotCheck.errors.join(" · ")}</p>
                      </li>
                    )}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setWhyReceipt(spotCheck.receipt)}
                  >
                    Why this step
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 12 }}
              onClick={() => loadChain()}
            >
              Re-check chain
            </button>
          </>
        )}
      </div>

      <div className="verify-rest">
        {children}
        {!loading && chain && chain.receipts.length > 0 && (
          <>
            <p className="eyebrow tape-kicker">Receipt tape</p>
            <ul className="tape-list">
              {chain.receipts.map((r) => {
                const step = chain.stepResults.find((s) => s.id === r.id);
                const stepFail =
                  step && (!step.signatureValid || !step.chainIntact);
                const highlighted = spotCheck?.id === r.id;
                return (
                  <li
                    key={r.id}
                    className={`${highlighted ? "is-highlight" : ""} ${stepFail ? "is-broken" : ""}`.trim()}
                  >
                    <div className="tape-main">
                      <span className="eyebrow tape-seq">
                        {String(r.sequence).padStart(2, "0")}
                      </span>
                      <span
                        className={`pill ${r.policyDecision === "block" ? "pill-block" : "pill-ok"}`}
                      >
                        {r.policyDecision}
                      </span>
                      <span className="mono tape-tool">{r.tool}</span>
                      <span className="mono tape-id blob-id">{r.id}</span>
                    </div>
                    <div className="tape-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => onPickFromTape(r.id)}
                      >
                        Use UUID
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => void verifyId(r.id)}
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setWhyReceipt(r)}
                      >
                        Why
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
