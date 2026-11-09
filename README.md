# LedgerMind

The agent remembers your spending refusal on Walrus Mainnet, and a signed receipt shows it never read your card.

Reject StreamBox Plus at $45. Walrus stores the rule. The next pass can filter it. `read_card_details` is blocked in policy and still signed.

Total Recall hackathon · Consumer finance · Tatum × Walrus Memory.

| | |
| :--- | :--- |
| See it | `npm run dev`, then [http://localhost:3000/demo](http://localhost:3000/demo) |
| Run the proof | `node --import tsx scripts/verify-e2e.mjs` (needs `.env`) |
| What works today | [Below](#what-works-today) |
| Blog | Not published yet. Draft: [docs/BLOG-total-recall.md](docs/BLOG-total-recall.md). Replace this line with the public URL when the post is live. |

**Where the proof ran.** Walrus Memory writes use the Mainnet relayer `https://relayer.memory.walrus.xyz`. Tatum reads a Sui checkpoint from `https://sui-mainnet.gateway.tatum.io/graphql`. The optional receipt anchor is a Sui **testnet** transaction. It is not Mainnet.

One observed loop, 9 November 2026: a fresh namespace, one rejection, blob `WhWDQ7OAtumfwG33s7rnhMeFlOiiASz7n_Ut5_xIrFY`, receipt `c6523bf0-4e28-4728-a13b-e8fd37e746df` with `suiCheckpoint=343382222`.

| What has been observed | Where the boundary is |
| :--- | :--- |
| `rememberAndWait` returned `blob_id=zReARhjqYavhLRmwyiv3eJg1XNclXjlkAG8qoVHv35M`, status `done` | Your `MEMWAL_*` keys. Memwal has no wipe. |
| Recall filtered `E2E Probe 1794233170322` after the session map was cleared | The memory text must match `rejected subscription {name} at {price}/month`. A sentence that does not match can be recalled and the offer still recommended. |
| Ed25519 signature on receipt `c6523bf0-4e28-4728-a13b-e8fd37e746df` | Local `data/receipts.json`. The live file can FAIL when sequence numbers collide. That FAIL stays. The offline exhibit is the chain you tamper on purpose. |
| Tatum GraphQL checkpoint `343382222` stored as `suiCheckpoint` | Allow-path receipts only, and only when `TATUM_API_KEY` works. Tatum does not allow or block a tool. |
| Sui testnet publish [EERRm1NXTrkWwzHMfcRaogtx8cDQWzrUPE4bNRksizS8](https://testnet.suivision.xyz/txblock/EERRm1NXTrkWwzHMfcRaogtx8cDQWzrUPE4bNRksizS8), package `0x9287817efffc4db01d6d32634431517962cc3b7913ac66f183c34df4b898c92c` | Testnet gas. Optional. Not a user-fund transfer. |

The Sui anchor is testnet. Walrus and Tatum are Mainnet. No user funds move.

## The $45 refusal

An agent suggests StreamBox Plus again because the last refusal lived in a chat window. LedgerMind writes that refusal to Walrus and shows the next list with the offer blocked, plus the blob id.

## Try it

| Step | Do this | You should see |
| :--- | :--- | :--- |
| 1 | Open `/demo` | StreamBox Plus at $45, still open |
| 2 | Reject it as too expensive | A Walrus Mainnet blob id, then the offer under Blocked |
| 3 | Refresh | The same offer stays filtered when recall returns that memory |
| 4 | **Try read_card_details** | Policy block. A signed receipt. No checkpoint on that row. |
| 5 | Open `/verify`, then **Simulate tamper** on the offline exhibit | FAIL. Reload exhibit returns PASS. |

`/memories` is the learning log. `/evidence` is the proof page and what this is not.

## Set up `.env`

`.env` is gitignored. Copy the example and fill it. Do not commit the filled file.

```bash
cp .env.example .env
npm install
npm run dev
```

| Variable | What to put | Required for |
| :--- | :--- | :--- |
| `MEMWAL_PRIVATE_KEY` | Memwal key | Walrus writes and recall |
| `MEMWAL_ACCOUNT_ID` | Memwal account | Walrus writes and recall |
| `MEMWAL_RELAYER_URL` | `https://relayer.memory.walrus.xyz` | Must be this Mainnet host. A staging or dev URL is the wrong cluster. |
| `MEMWAL_NAMESPACE` | `ledgermind` | Memory namespace. The e2e script switches to a fresh one so it does not pretend to delete old blobs. |
| `TATUM_API_KEY` | Tatum key | Checkpoint on allow receipts |
| `RECEIPT_PROXY_SECRET_HEX` | 64-character hex | Ed25519 receipt signing. If empty, the server generates one for the process. |
| `SUI_PRIVATE_KEY` | 64-character hex or `suiprivkey1…` | Optional. Fund the wallet on **Sui testnet**. |
| `SUI_GRPC_URL` | Leave the example | The anchor client uses testnet gRPC itself. It does not spend Mainnet gas. |
| `SUI_ANCHOR_PACKAGE_ID` | Set after `npm run publish:anchor` | Optional testnet package |
| `PUBLIC_MEMORY_BLOB_IDS` | Comma-separated blob ids | Optional, when the memory API cannot list |

Check a Mainnet write without the UI:

```bash
node scripts/verify-memory.mjs
node --import tsx scripts/verify-e2e.mjs
```

`verify-memory.mjs` prints `PASS: blob_id=…` or `FAIL`. The e2e script recommends a probe, rejects it, checks the blob, the filter, the signature, and the stored checkpoint.

## What works today

**Observed.** Mainnet Walrus `rememberAndWait` and recall-based filtering for a matching rejection sentence. Tatum GraphQL checkpoint stored on an allow receipt (`343382222`). Ed25519 verify of that receipt. Sui testnet package publish above.

**Built, not observed as a second product.** The desk anchor button (`POST /api/receipts/anchor`) after `npm run publish:anchor`. It anchors a batch hash on testnet. It is not required for the $45 loop.

**Deliberately absent.** No card issuance, no PAN storage, no custody, no user-fund transfer, no zero-knowledge proof, no Sui JSON-RPC, no Mainnet anchor.

## License

MIT
