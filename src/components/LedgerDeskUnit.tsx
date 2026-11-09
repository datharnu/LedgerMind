/** Hero illustration: subscription desk with memory + receipt window (Ledger identity, not a flight recorder). */
export function LedgerDeskUnit() {
  return (
    <figure className="desk-unit-figure">
      <svg
        className="desk-unit"
        viewBox="0 0 520 400"
        role="img"
        aria-labelledby="desk-unit-title"
      >
        <title id="desk-unit-title">
          LedgerMind desk: subscription offer, Walrus memory write, and blocked card
          read on the receipt tape.
        </title>
        <defs>
          <linearGradient id="desk-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
          <linearGradient id="desk-screen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        {/* base shadow */}
        <ellipse cx="260" cy="372" rx="200" ry="18" fill="#0b0d12" opacity="0.08" />
        {/* stand */}
        <path d="M220 320h80v28c0 8-36 14-40 14s-40-6-40-14v-28z" fill="#334155" />
        {/* body */}
        <rect
          x="56"
          y="48"
          width="408"
          height="280"
          rx="20"
          fill="url(#desk-body)"
        />
        <rect
          x="56"
          y="48"
          width="408"
          height="8"
          rx="20"
          fill="#fff"
          opacity="0.12"
        />
        {/* screen */}
        <rect
          x="88"
          y="80"
          width="344"
          height="200"
          rx="12"
          fill="url(#desk-screen)"
        />
        <text
          x="108"
          y="108"
          fill="#64748b"
          fontSize="11"
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.12em"
        >
          SUGGEST · DESK
        </text>
        {/* offer card */}
        <rect x="108" y="122" width="200" height="72" rx="10" fill="#fff" />
        <rect x="108" y="122" width="4" height="72" rx="2" fill="#1b4dff" />
        <text x="124" y="148" fill="#0b0d12" fontSize="15" fontWeight="700">
          StreamBox Plus
        </text>
        <text
          x="124"
          y="172"
          fill="#1b4dff"
          fontSize="18"
          fontWeight="700"
          fontFamily="ui-monospace, monospace"
        >
          $45/mo
        </text>
        <rect x="248" y="138" width="44" height="22" rx="6" fill="#e8f5ef" />
        <text
          x="258"
          y="153"
          fill="#0f8b5f"
          fontSize="10"
          fontWeight="700"
          fontFamily="ui-monospace, monospace"
        >
          ALLOW
        </text>
        {/* memory blob */}
        <circle cx="372" cy="148" r="36" fill="#eef2ff" />
        <circle cx="372" cy="148" r="22" fill="#1b4dff" opacity="0.85" />
        <text
          x="372"
          y="153"
          textAnchor="middle"
          fill="#fff"
          fontSize="10"
          fontWeight="700"
          fontFamily="ui-monospace, monospace"
        >
          W
        </text>
        <text
          x="372"
          y="198"
          textAnchor="middle"
          fill="#475569"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
        >
          blob_id
        </text>
        {/* mini tape */}
        <rect x="108" y="208" width="304" height="56" rx="8" fill="#0f172a" />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={130 + i * 72}
            y={228}
            width="12"
            height={i === 3 ? 28 : 16}
            rx="2"
            fill={i === 3 ? "#d92d20" : "#e2e8f0"}
          />
        ))}
        <text
          x="130"
          y="252"
          fill="#94a3b8"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
        >
          read_card_details · BLOCK
        </text>
        {/* plate */}
        <rect x="88" y="292" width="160" height="28" rx="6" fill="#0f172a" />
        <text
          x="100"
          y="310"
          fill="#94a3b8"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.06em"
        >
          SIGNED · CHAINED · VERIFY
        </text>
      </svg>
      <figcaption className="desk-unit-cap">
        One reject writes Walrus memory; the next pass filters; blocks stay on the
        tape.
      </figcaption>
    </figure>
  );
}
