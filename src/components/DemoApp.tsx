"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BlobId } from "@/components/BlobId";
import { BrandLoading, Spinner } from "@/components/Spinner";
import {
  ReceiptWhyDrawer,
  type ReceiptDetail,
} from "@/components/ReceiptWhyDrawer";

type Candidate = {
  id: string;
  name: string;
  priceMonthly: number;
  category: string;
};

type SuggestResponse = {
  suggestions: Candidate[];
  filteredOut: { candidate: Candidate; reason: string }[];
  memoriesUsed: { blobId?: string; text: string; distance?: number }[];
};

export function DemoApp({ onReady }: { onReady?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoaded = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SuggestResponse | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"accepted" | "rejected" | null>(
    null,
  );
  const [lastMemory, setLastMemory] = useState<{
    blobId?: string;
    text: string;
  } | null>(null);
  const [receipts, setReceipts] = useState<ReceiptDetail[]>([]);
  const [whyReceipt, setWhyReceipt] = useState<ReceiptDetail | null>(null);
  const [anchorBusy, setAnchorBusy] = useState(false);
  const [anchorInfo, setAnchorInfo] = useState<{
    digest: string;
    batchHash: string;
  } | null>(null);
  const [guardBusy, setGuardBusy] = useState(false);
  const [freshReceiptId, setFreshReceiptId] = useState<string | null>(null);
  const [freshBlockedId, setFreshBlockedId] = useState<string | null>(null);
  const [pane, setPane] = useState<"offers" | "guard">("offers");
  const seenReceipts = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (hasLoaded.current) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [suggestRes, receiptRes] = await Promise.all([
        fetch("/api/suggest"),
        fetch("/api/receipts"),
      ]);
      if (!suggestRes.ok) {
        throw new Error((await suggestRes.json()).error ?? "Suggest failed");
      }
      const suggest = (await suggestRes.json()) as SuggestResponse;
      setData(suggest);
      if (receiptRes.ok) {
        const r = (await receiptRes.json()) as { receipts: ReceiptDetail[] };
        const next = r.receipts.slice(-8).reverse();
        const newest = next[0];
        if (
          hasLoaded.current &&
          newest &&
          !seenReceipts.current.has(newest.id)
        ) {
          setFreshReceiptId(newest.id);
        }
        for (const item of next) seenReceipts.current.add(item.id);
        setReceipts(next);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      hasLoaded.current = true;
      setLoading(false);
      setRefreshing(false);
      onReadyRef.current?.();
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function sendFeedback(
    candidateId: string,
    action: "accepted" | "rejected",
    reason?: string,
  ) {
    setBusyId(candidateId);
    setBusyAction(action);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, action, reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Feedback failed");
      setLastMemory({ blobId: json.memory?.blobId, text: json.memoryText });
      if (action === "rejected") setFreshBlockedId(candidateId);
      setData((prev) => {
        if (!prev) return prev;
        const candidate = prev.suggestions.find((c) => c.id === candidateId);
        if (!candidate) return prev;
        const suggestions = prev.suggestions.filter((c) => c.id !== candidateId);
        if (action === "rejected") {
          const rejectReason = reason ?? "too expensive";
          return {
            ...prev,
            suggestions,
            filteredOut: [
              ...prev.filteredOut.filter((f) => f.candidate.id !== candidateId),
              {
                candidate,
                reason: `Rejected: ${rejectReason}`,
              },
            ],
          };
        }
        return { ...prev, suggestions };
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Feedback failed");
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  }

  async function anchorOnchain() {
    setAnchorBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/receipts/anchor", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "anchor failed");
      setAnchorInfo({ digest: json.digest, batchHash: json.batchHash });
    } catch (e) {
      setError(e instanceof Error ? e.message : "anchor failed");
    } finally {
      setAnchorBusy(false);
    }
  }

  async function demoBlockedRead() {
    setGuardBusy(true);
    setError(null);
    try {
      const [res] = await Promise.all([
        fetch("/api/policy/secret-read", { method: "POST" }),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "blocked demo failed");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "blocked demo failed");
    } finally {
      setGuardBusy(false);
    }
  }

  if (loading) {
    return <BrandLoading label="Loading your desk" />;
  }

  const memories = data?.memoriesUsed ?? [];
  const memoryRows =
    lastMemory?.blobId && !memories.some((m) => m.blobId === lastMemory.blobId)
      ? [lastMemory, ...memories]
      : memories;
  const writing = busyId !== null || guardBusy || anchorBusy;

  function blobFor(name: string) {
    if (lastMemory?.blobId && lastMemory.text.includes(name)) return lastMemory.blobId;
    return memoryRows.find((m) => m.blobId && m.text.includes(name))?.blobId;
  }

  return (
    <div className="paper-desk">
      {error && (
        <div className="alert" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void refresh()}>
            Try again
          </button>
        </div>
      )}
      {refreshing && (
        <p className="paper-status" role="status">
          <Spinner /> Updating the desk…
        </p>
      )}

      <div
        className="desk-status-bar"
        role="status"
        aria-live="polite"
      >
        <span className="lamp lamp-ok">
          <i aria-hidden /> Open {data?.suggestions.length ?? 0}
        </span>
        <span className="lamp lamp-warn">
          <i aria-hidden /> Blocked {data?.filteredOut.length ?? 0}
        </span>
        <span className="lamp lamp-idle">
          <i aria-hidden /> Receipts {receipts.length}
        </span>
        <span className="lamp lamp-idle">
          <i aria-hidden /> Memories {memoryRows.length}
        </span>
      </div>

      <div className="paper-tabs" role="tablist" aria-label="Desk sections">
        <button type="button" role="tab" aria-selected={pane === "offers"} onClick={() => setPane("offers")}>
          Suggestions
        </button>
        <button type="button" role="tab" aria-selected={pane === "guard"} onClick={() => setPane("guard")}>
          Memory &amp; guard
        </button>
      </div>

      <div className="paper-cols">
        <section
          className="paper-sheet paper-sheet-offers"
          data-active={pane === "offers"}
          aria-label="Suggestions"
        >
          <div className="paper-head">
            <div className="paper-head-row">
              <h2>Suggestions</h2>
              <span className="paper-count tabular">
                {data?.suggestions.length ?? 0}
              </span>
            </div>
            <p className="paper-note">
              Accept or reject — demo only; no real billing. Reject saves Walrus
              memory and filters on refresh.
            </p>
          </div>
          <div className="paper-body">
            <div className="paper-sec">
              <div className="paper-sec-title">
                <h3>Blocked</h3>
                <span className="paper-note">{data?.filteredOut.length ?? 0}</span>
              </div>
              {!data?.filteredOut.length ? (
                <div className="paper-empty paper-empty-soft">
                  Reject an offer and it lands here, with the reason and its Walrus blob id.
                </div>
              ) : (
                <ul className="block-list">
                  {data.filteredOut.map(({ candidate, reason }) => (
                    <li
                      key={candidate.id}
                      className={`block-row${freshBlockedId === candidate.id ? " card-arrive" : ""}`}
                    >
                      <div className="block-top">
                        <span className="chip chip-block">Blocked</span>
                        <span className="queue-price">${candidate.priceMonthly}/mo</span>
                      </div>
                      <h3 className="block-name">{candidate.name}</h3>
                      <p className="reason">{reason}</p>
                      <BlobId
                        value={blobFor(candidate.name)}
                        label="Walrus Mainnet blob id"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="paper-sec">
              <div className="paper-sec-title">
                <h3>Waiting on you</h3>
                <span className="paper-note">{data?.suggestions.length ?? 0}</span>
              </div>
              {!data || (data.suggestions.length === 0 && data.filteredOut.length === 0) ? (
                <div className="paper-empty">No offers to show.</div>
              ) : data.suggestions.length === 0 ? (
                <div className="paper-empty">
                  No open offers. Everything was accepted or blocked by memory.
                </div>
              ) : (
                <ul className="queue">
                  {data.suggestions.map((c) => {
                    const acceptBusy = busyId === c.id && busyAction === "accepted";
                    const rejectBusy = busyId === c.id && busyAction === "rejected";
                    return (
                      <li key={c.id} className="queue-row">
                        <div className="queue-main">
                          <strong>{c.name}</strong>
                          <span className="queue-meta">{c.category}</span>
                        </div>
                        <span className="queue-price">${c.priceMonthly}/mo</span>
                        <div className="queue-actions">
                          <button
                            type="button"
                            className={`btn btn-primary btn-sm${acceptBusy ? " is-busy" : ""}`}
                            disabled={writing}
                            onClick={() => void sendFeedback(c.id, "accepted")}
                          >
                            {acceptBusy ? (
                              <>
                                <Spinner /> Saving…
                              </>
                            ) : (
                              "Accept"
                            )}
                          </button>
                          <button
                            type="button"
                            className={`btn btn-danger btn-sm${rejectBusy ? " is-busy" : ""}`}
                            disabled={writing}
                            onClick={() =>
                              void sendFeedback(c.id, "rejected", "too expensive")
                            }
                          >
                            {rejectBusy ? (
                              <>
                                <Spinner /> Saving…
                              </>
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section
          className="paper-sheet paper-sheet-guard"
          data-active={pane === "guard"}
          aria-label="Memory and guard"
        >
          <div className="paper-head paper-head-guard">
            <div className="paper-head-row">
              <h2>Memory &amp; guard</h2>
            </div>
            <button
              type="button"
              className={`btn btn-guard wide${guardBusy ? " is-busy" : ""}`}
              disabled={writing}
              onClick={() => void demoBlockedRead()}
            >
              {guardBusy ? (
                <>
                  <Spinner /> Policy check…
                </>
              ) : (
                "Try read_card_details"
              )}
            </button>
            <p className="paper-note">
              Out-of-bounds tool — blocked before any card data; still signed on
              the tape.
            </p>
          </div>
          <div className="paper-body">
            <div className="paper-sec">
              <div className="paper-sec-title">
                <h3>Receipts</h3>
                <span className="paper-note">{receipts.length}</span>
              </div>
              {receipts.length === 0 ? (
                <div className="paper-empty">
                  No tool calls yet. Try to read card details and the block lands here.
                </div>
              ) : (
                <div className="ledger-scroll">
                  <table className="ledger-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Tool</th>
                        <th>Reason</th>
                        <th>Checkpoint</th>
                        <th>
                          <span className="sr-only">Details</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((r) => {
                        const blocked = r.policyDecision === "block";
                        return (
                          <tr
                            key={r.id}
                            className={`${blocked ? "is-block" : ""}${freshReceiptId === r.id ? " receipt-arrive" : ""}`}
                          >
                            <td>
                              <span className={`chip${blocked ? " chip-block" : " chip-allow"}`}>
                                {blocked ? "Blocked" : "Allowed"}
                              </span>
                            </td>
                            <td className="ledger-tool">{r.tool}</td>
                            <td>{r.policyReason}</td>
                            <td className="ledger-tool">
                              {r.suiCheckpoint
                                ? r.suiCheckpoint
                                : blocked
                                  ? "—"
                                  : "Pending"}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="ledger-why"
                                onClick={() => setWhyReceipt(r)}
                              >
                                Why
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="paper-sec">
              <div className="paper-sec-title">
                <h3>Memories</h3>
                <span className="paper-note">Newest first · {memoryRows.length}</span>
              </div>
              {memoryRows.length === 0 ? (
                <div className="paper-empty">
                  Nothing learned yet. Reject an offer and the memory appears here with its blob id.
                </div>
              ) : (
                <ol className="ray-log">
                  {memoryRows.map((m, i) => (
                    <li key={`${m.blobId ?? "memory"}-${i}`} className="ray-line">
                      <span className="ray-index">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <p>{m.text}</p>
                        <span className="ray-id">{m.blobId ?? "No blob id"}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
          <div className="paper-foot">
            <button
              type="button"
              className={`btn btn-secondary wide${anchorBusy ? " is-busy" : ""}`}
              disabled={writing || receipts.length === 0}
              onClick={() => void anchorOnchain()}
            >
              {anchorBusy ? <><Spinner /> Anchoring…</> : "Anchor batch on Sui testnet"}
            </button>
            <p className="paper-note">Optional, and testnet. Walrus and Tatum stay on Mainnet.</p>
            {anchorInfo && (
              <p className="paper-note">
                Receipt anchored on Sui testnet.{" "}
                <a
                  href={`https://testnet.suivision.xyz/txblock/${anchorInfo.digest}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Tx
                </a>
              </p>
            )}
          </div>
        </section>
      </div>

      <ReceiptWhyDrawer receipt={whyReceipt} onClose={() => setWhyReceipt(null)} />
    </div>
  );
}
