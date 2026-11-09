import Link from "next/link";
import { CanonicalLoop } from "@/components/CanonicalLoop";
import { SiteHeader } from "@/components/SiteHeader";
import "../landing.css";

const NOT = [
  {
    title: "THIS IS NOT A CARD ISSUER.",
    body: "read_card_details is blocked and receipted — no PAN storage.",
  },
  {
    title: "THIS IS NOT “AI THAT MOVES MONEY.”",
    body: "Accept/reject are explicit clicks; receipts log tool calls only.",
  },
  {
    title: "THIS IS NOT CUSTODY OR ZK.",
    body: "Trust = Ed25519 chain + policy + Walrus blobs + optional Sui anchor.",
  },
];

export default function EvidencePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap" style={{ paddingBottom: 72 }}>
        <section className="hero" style={{ paddingBottom: 32 }}>
          <p className="eyebrow">Walrus & proof</p>
          <h1 style={{ fontSize: "clamp(1.75rem,3vw,2.25rem)", margin: "8px 0" }}>
            How to verify the build.
          </h1>
          <p className="hero-lead">
            Run the demo sequence, confirm Walrus memories, and check the receipt
            chain on Audit trail — including offline tamper detection.
          </p>
        </section>

        <section id="judge" className="section" style={{ paddingTop: 0, borderTop: 0 }}>
          <div className="sheet">
            <CanonicalLoop />
            <div className="hero-cta" style={{ marginTop: 20 }}>
              <Link className="btn btn-primary" href="/demo">
                Open your desk
              </Link>
              <Link className="btn btn-secondary" href="/verify">
                Audit trail
              </Link>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 32 }}>
          <h2>Learning log</h2>
          <p className="section-intro">
            Each reject writes a memory on Walrus Mainnet. The next suggest pass
            recalls it — filtered rows show the reason on your desk.
          </p>
          <Link className="btn btn-secondary" href="/memories">
            View memories
          </Link>
        </section>

        <section id="limits" className="section" style={{ paddingTop: 32 }}>
          <h2>What this is not</h2>
          <div className="not-list">
            {NOT.map(({ title, body }) => (
              <article key={title} className="not-item">
                <strong>{title}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
