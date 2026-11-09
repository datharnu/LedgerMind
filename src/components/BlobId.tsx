"use client";

import { useState } from "react";

export function BlobId({
  value,
  label = "Walrus Mainnet blob id",
}: {
  value?: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);
  if (!value) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(value!);
      setDone(true);
      window.setTimeout(() => setDone(false), 1400);
    } catch {
      setDone(false);
    }
  }

  return (
    <div className="blobrow">
      <div className="blob">
        <span className="blob-label">{label}</span>
        {value}
      </div>
      <button
        type="button"
        className="copy"
        onClick={() => void copy()}
        aria-label={done ? "Copied" : "Copy blob id"}
      >
        {done ? "OK" : "Copy"}
      </button>
    </div>
  );
}
