import Link from "next/link";

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden focusable="false">
      <rect width="32" height="32" rx="8" fill="#172554" />
      <rect x="11.25" y="9.25" width="14" height="16.5" rx="2.25" fill="#1b4dff" />
      <rect x="6.75" y="6.25" width="14" height="16.5" rx="2.25" fill="#f4f6f8" />
      <path
        d="M9 9.2v10.7"
        stroke="#1b4dff"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M11.6 12.2h6.4M11.6 15.4h4.4"
        stroke="#172554"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden focusable="false">
      <path
        d="M4 10h11m-4-4.5L15.5 10 11 14.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ href = "/", tag }: { href?: string; tag?: string }) {
  return (
    <Link className="logo" href={href} aria-label="LedgerMind, home">
      <Mark />
      <span>LedgerMind</span>
      {tag ? <small>{tag}</small> : null}
    </Link>
  );
}
