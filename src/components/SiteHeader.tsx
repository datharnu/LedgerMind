import Link from "next/link";
import { Arrow, Logo } from "@/components/brand";

const NAV = [
  { href: "/#problem", label: "Why this hurts" },
  { href: "/evidence", label: "Walrus & proof" },
  { href: "/verify", label: "Audit trail" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap site-header-row">
        <Logo />
        <nav aria-label="Primary" className="site-nav">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="btn btn-primary btn-sm" href="/demo">
          Open your desk <Arrow />
        </Link>
      </div>
    </header>
  );
}
