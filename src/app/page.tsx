import Link from "next/link";
import { Arrow } from "@/components/brand";
import { CanonicalLoop } from "@/components/CanonicalLoop";
import { LedgerDeskUnit } from "@/components/LedgerDeskUnit";
import { ReceiptTape } from "@/components/ReceiptTape";
import { SiteHeader } from "@/components/SiteHeader";
import "./landing.css";

const STEPS: [string, string][] = [
  [
    "Remember",
    "Reject an offer — Walrus Mainnet stores your rule with a blob id.",
  ],
  [
    "Filter",
    "Recall changes the next suggestion pass; blocked offers show why.",
  ],
  [
    "Prove",
    "Ed25519 receipts chain every tool call; verify PASS or tamper FAIL.",
  ],
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero wrap">
          <div className="hero-grid hero-grid-visual">
            <div>
              <p className="eyebrow">Consumer finance</p>
              <h1>Your agent forgets refusals. Walrus does not.</h1>
              <p className="hero-lead">
                LedgerMind is a subscription desk: teach a spending rule once on
                Walrus Memory, see the next pass filter it, and keep a signed
                receipt chain — including when card reads are{" "}
                <strong>blocked</strong>.
              </p>
              <div className="hero-cta">
                <Link className="btn btn-primary" href="/demo">
                  Open your desk <Arrow />
                </Link>
                <Link className="btn btn-secondary" href="/verify">
                  Audit trail
                </Link>
              </div>
              <p className="contrast-line">
                The agent suggests. You refuse once. Walrus remembers. The
                receipt proves the card never opened.
              </p>
            </div>
            <LedgerDeskUnit />
          </div>
        </section>

        <section className="tape-band" aria-labelledby="tape-title">
          <div className="tape-band-art" aria-hidden>
            <div className="tape-band-glow" />
          </div>
          <div className="wrap tape-band-inner">
            <div className="tape-band-copy">
              <h2 id="tape-title">
                You refuse once. <em>The tape keeps the receipts.</em>
              </h2>
              <p>
                Signed steps chained on your desk — including policy blocks before
                any card payload returns.
              </p>
            </div>
            <ReceiptTape />
          </div>
        </section>

        <section id="problem" className="section wrap">
          <p className="eyebrow">The problem</p>
          <h2>Subscriptions replay because nothing persists.</h2>
          <p className="section-intro">
            Agents re-suggest what you already rejected. Portable memory fixes
            preferences; receipts fix trust when money-adjacent tools are involved.
          </p>
          <dl className="stat-row">
            <div className="stat">
              <dt>Example offer</dt>
              <dd className="amount tabular">$45</dd>
              <p className="stat-note">StreamBox Plus / mo</p>
            </div>
            <div className="stat">
              <dt>After one reject</dt>
              <dd className="tabular">1</dd>
              <p className="stat-note">Walrus memory write</p>
            </div>
            <div className="stat">
              <dt>Card read attempt</dt>
              <dd className="stat-block">BLOCK</dd>
              <p className="stat-note">Still on receipt tape</p>
            </div>
          </dl>
        </section>

        <section id="how" className="section wrap">
          <h2 className="section-band-h">Three steps on your desk.</h2>
          <ol className="landing-steps">
            {STEPS.map(([title, body], index) => (
              <li key={title}>
                <p className="eyebrow">0{index + 1}</p>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <div id="sequence" className="sheet sheet-inset" style={{ marginTop: 32 }}>
            <CanonicalLoop />
          </div>
        </section>

        <section id="sponsors" className="section wrap">
          <p className="eyebrow">Integrations</p>
          <h2>Walrus learns. Tatum grounds. Neither moves user funds.</h2>
          <p className="section-intro">
            Memory changes suggestions on the next refresh. Tatum returns a Sui
            checkpoint on allow-path receipts when configured.
          </p>
          <div className="sponsor-row">
            <span className="sponsor-chip">Walrus Memory · Mainnet</span>
            <span className="sponsor-chip">Tatum · Sui GraphQL</span>
            <span className="sponsor-chip">Ed25519 receipt chain</span>
          </div>
        </section>

        <section className="section wrap">
          <p className="eyebrow">Proof</p>
          <h2>Try the loop, then verify the tape.</h2>
          <p className="section-intro">
            Walrus writes, policy blocks, and scope limits — on Walrus &amp; proof.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/demo">
              Your desk <Arrow />
            </Link>
            <Link className="btn btn-secondary" href="/evidence">
              Walrus &amp; proof
            </Link>
          </div>
        </section>
      </main>
      <footer className="site-footer wrap">
        <p>
          Not a card issuer. Not custody. Not ZK. Memories on Walrus; checkpoints
          via Tatum; policy blocks are receipted.
        </p>
      </footer>
    </>
  );
}
