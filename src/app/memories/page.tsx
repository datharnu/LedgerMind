"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageLoading } from "@/components/Spinner";
import { SiteHeader } from "@/components/SiteHeader";
import "../landing.css";

type Memory = { blob_id: string; text: string; distance?: number };

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/memories")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setConfigured(json.configured);
        setMemories(json.memories ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "load failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <SiteHeader />
      <main id="main" className="wrap page-fill log-page">
        <section className="log-intro">
          <p className="eyebrow">Walrus Memory · Mainnet</p>
          <h1>Learning log</h1>
          <p>
            Each row is a Walrus Mainnet memory with its blob ID and plaintext
            text — the same store recall uses on your desk.
          </p>
          {!loading && configured && (
            <p className="tabular log-count">Count: {memories.length}</p>
          )}
        </section>

        {loading && <PageLoading label="Loading Walrus memories" />}

        {!loading && error && <div className="alert">{error}</div>}

        {!loading && !error && !configured && (
          <div className="sheet">
            <p className="eyebrow">Not configured</p>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              Walrus Memory is not available on this deployment. Reject a
              subscription on your desk to write a live memory when enabled.
            </p>
          </div>
        )}

        {!loading && configured && (
          <div className="page-scroll">
            {memories.length === 0 && (
              <p>No memories yet. Reject an offer on your desk to write one.</p>
            )}
            <ul className="not-list" style={{ padding: 0, listStyle: "none" }}>
              {memories.map((m) => (
                <li key={m.blob_id} className="not-item">
                  <p className="mono" style={{ fontSize: 14, margin: "0 0 8px", overflowWrap: "anywhere" }}>
                    {m.blob_id}
                  </p>
                  <p style={{ margin: 0 }}>{m.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link className="btn btn-secondary log-back" href="/demo">
          Back to your desk
        </Link>
      </main>
    </div>
  );
}
