"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoApp } from "@/components/DemoApp";
import { SiteHeader } from "@/components/SiteHeader";

export function DemoFrame() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <SiteHeader />
      <div className="desk-page wrap" id="main">
        {ready && (
          <header className="desk-page-header">
            <div>
              <p className="eyebrow">Your desk</p>
              <h1>Live subscription loop</h1>
              <p>
                Reject writes Walrus memory; refresh filters offers; card reads stay
                blocked on the receipt tape.
              </p>
            </div>
            <div className="desk-page-actions">
              <Link className="desk-proof" href="/#sequence">
                Demo sequence
              </Link>
              <Link className="desk-proof" href="/verify">
                Audit trail
              </Link>
              <Link className="desk-proof" href="/memories">
                Memories
              </Link>
            </div>
          </header>
        )}
        <DemoApp onReady={() => setReady(true)} />
      </div>
    </>
  );
}
