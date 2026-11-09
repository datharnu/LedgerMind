# The agent forgets your refusal. Walrus does not.

LedgerMind is a subscription desk for the Tatum × Walrus “Total Recall” hackathon, consumer-finance track. You reject an offer once. Walrus Memory on Mainnet stores that rule. The next suggestion pass can filter it. Every tool call, including a blocked card read, is an Ed25519 receipt tied to a Sui checkpoint from Tatum’s GraphQL API.

Nothing here moves user funds. It is not a wallet, a card issuer, or a custody product.

## What a judge can watch

Open `/demo`.

1. The desk suggests StreamBox Plus at $45 a month. That suggestion is an allow: `query_price` is on the policy list, and the receipt can carry a Tatum checkpoint.
2. Reject it as “too expensive.” The server calls Walrus `rememberAndWait` and writes a `log_spending` receipt.
3. Refresh. Recall runs before the next ranking. If the memory text matches a rejected subscription name, StreamBox leaves the open list and shows up as blocked, with the blob id.
4. Press **Try read_card_details**. Policy refuses before any card data is returned. The attempt is still signed. Block receipts do not get a Tatum checkpoint, on purpose: a refusal is not an allow-path stamp.

Then open `/verify`. **Verify** on a tape row scrolls to that step’s signature and hash link. The offline exhibit, “card read blocked at step 06,” verifies in the browser from `public/samples/exhibit-chain.json`. **Simulate tamper** flips one content hash and the same checker returns FAIL. That FAIL is the point. Reload puts the exhibit back to PASS.

## Walrus is the memory

The client is `@mysten-incubation/memwal`, pointed at the Mainnet relayer `https://relayer.memory.walrus.xyz`. A reject formats one sentence:

`User rejected subscription StreamBox Plus at USD45/month category seed because: too expensive.`

`rememberAndWait` returns a `blob_id` only when the write is done. `/memories` lists those blobs in plaintext. Recall uses the query “user spending limits rejected subscriptions price caps,” with a distance cap.

The filter is a parser, not a vibe. It looks for `rejected subscription {name} at {price}/month`. A matching name is removed. A “too expensive” reason also sets a price cap, and a later offer above that cap is removed. A sentence that does not match the pattern can still be recalled and shown, and the offer stays recommended. That happened in an isolated check: the memory `verify: user rejected subscription at 45 CNY because too expensive` was cited (`blob_id=qKTJKKYbe2LLDUR9CAUJE_e081uDLIcOvTYMk23Wh10`) and the $45 offer was still suggested. The desk’s own sentence shape does filter.

Observed writes, 9 November 2026:

- Checkbox write: `blob_id=zReARhjqYavhLRmwyiv3eJg1XNclXjlkAG8qoVHv35M`, status `done`.
- End-to-end probe in a fresh namespace: `blob_id=WhWDQ7OAtumfwG33s7rnhMeFlOiiASz7n_Ut5_xIrFY`. After the in-memory session map was cleared, the next suggestion said `Previously rejected: E2E Probe 1794233170322`. That filter came from recall.

Memwal has no wipe. The probe used a new namespace so it did not pretend to delete older memories.

## Tatum grounds the receipt. It does not decide.

Allow-path receipts call Tatum Sui Mainnet GraphQL, not JSON-RPC:

`https://sui-mainnet.gateway.tatum.io/graphql`

The query is `{ checkpoint { sequenceNumber } }`. The number is stored on the receipt as `suiCheckpoint` in `data/receipts.json`. A direct check returned checkpoint `343318009`. The end-to-end receipt `c6523bf0-4e28-4728-a13b-e8fd37e746df` stored `suiCheckpoint=343382222`, and its Ed25519 signature verified.

Tatum does not allow or block a tool. Policy does. If the GraphQL call fails, the allow receipt is still signed and the checkpoint field is empty. A missing feed is not rendered as a clean yes.

An optional button anchors a batch hash on Sui testnet. The observed publish is transaction `EERRm1NXTrkWwzHMfcRaogtx8cDQWzrUPE4bNRksizS8`, package `0x9287817efffc4db01d6d32634431517962cc3b7913ac66f183c34df4b898c92c`, on the testnet explorer. Walrus and Tatum stay on Mainnet. The anchor does not move user funds, and this post does not call it Mainnet.

## What the receipt is, and where it fails

Each tool call is hashed and signed with Ed25519. The next receipt stores the previous content hash. `/verify` recomputes that chain.

The live file can FAIL. Concurrent suggestion writes have produced duplicate sequence numbers, and the verifier reports the break instead of hiding it. Rewriting `data/receipts.json` to force a PASS would be a fake. The offline exhibit is the clean chain a judge can tamper on purpose. A block is a valid signed event. A broken hash is not.

## What this is not

- Not a card issuer. `read_card_details` is refused. No PAN is stored.
- Not custody, and not an agent that moves money. Accept and reject are explicit clicks. The receipt logs the tool call.
- Not a zero-knowledge proof.
- Not a Tatum product decision. The checkpoint is a public time mark on allow receipts.
- Not a Mainnet Sui settlement. The anchor, when used, is testnet.

## Run the proof

```bash
cp .env.example .env
npm install
npm run dev
```

Walrus needs `MEMWAL_PRIVATE_KEY`, `MEMWAL_ACCOUNT_ID`, and the Mainnet relayer URL. Tatum needs `TATUM_API_KEY`. Without those keys the desk still loads, and a missing checkpoint is not shown as success.

`node --import tsx scripts/verify-e2e.mjs` runs the loop above: fresh namespace, recommend, reject, Walrus blob, filter from recall, signed receipt, stored checkpoint.
