# LedgerMind — ~75s judge script (Total Recall)

Rehearse with `/evidence` open. Target **~75 seconds**; Walrus write may add ~15s on step 3 — keep narrating.

| Time | Click | Say aloud |
| :--- | :--- | :--- |
| 0:00 | This page or `/` | LedgerMind remembers what you refused on Walrus — and signs every tool call so a judge can verify without trusting our UI. |
| 0:08 | `/demo` | Consumer subscription desk. One canonical loop — not a feature tour. |
| 0:14 | Suggestions load / Accept | In bounds: `query_price` — allowed. Receipt lands; Tatum checkpoint when keys are set. |
| 0:24 | Reject StreamBox (“too expensive”) | Walrus Mainnet write — blob id on screen. That’s the sponsor changing the next decision. |
| 0:34 | Refresh suggestions | Recall filtered StreamBox and shows your reason. Learning is on the suggest path, not a badge. |
| 0:44 | “Read card details” (block control) | Out of bounds: `read_card_details` — blocked and still signed. No PAN, no custody claim. |
| 0:52 | `/verify` | PASS on the live chain — signatures and hash links intact. |
| 1:02 | Offline exhibit → **Simulate tamper** | FAIL in the browser — which means nobody can swap a step without breaking the chain. |
| 1:10 | `/memories` | Ten-plus memories with visible blob IDs — Walrus submission evidence. |
| 1:15 | — | Blackbox proves what an agent didn’t read in any session. We prove what your subscription agent remembered after you refused. |

**No Walrus keys:** Say “Setup required” on reject; still run offline exhibit PASS → tamper FAIL on `/verify`.

**Must-not-skip:** Tamper FAIL and one blocked `read_card_details` receipt on the tape.
