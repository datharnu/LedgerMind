import type { Metadata, Viewport } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "LedgerMind — spending rules that persist on Walrus",
  description:
    "Subscription agent with Walrus Memory and signed receipts grounded on Tatum Sui checkpoints.",
  applicationName: "LedgerMind",
};

export const viewport: Viewport = {
  themeColor: "#faf9f7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
