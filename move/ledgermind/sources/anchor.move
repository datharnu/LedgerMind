/// Emits receipt batch hash on-chain (Sui has no native transfer memo; event acts as public anchor).
module ledgermind::anchor {
    use sui::event;

  public struct ReceiptBatchAnchored has copy, drop {
        batch_hash: vector<u8>,
        label: vector<u8>,
    }

    /// Entry used by LedgerMind PTB after optional 1 MIST self-transfer.
    public entry fun anchor_batch(batch_hash: vector<u8>, label: vector<u8>) {
        event::emit(ReceiptBatchAnchored { batch_hash, label });
    }
}
