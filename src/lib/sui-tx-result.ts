type TxStatus = {
  success?: boolean;
  status?: string;
  error?: string | { message?: string } | null;
};

export type GrpcExecuteShape = {
  Transaction?: {
    digest?: string;
    status?: TxStatus;
    effects?: {
      status?: TxStatus;
    };
    events?: unknown;
    objectChanges?: unknown;
  };
  FailedTransaction?: {
    status?: { error?: { message?: string } };
  };
};

function statusFailure(status: TxStatus | undefined): string | null {
  if (!status) return null;
  if (status.success === false) {
    const err = status.error;
    if (typeof err === "string") return err;
    if (err && typeof err === "object" && err.message) return err.message;
    return "Transaction failed";
  }
  if (status.status && status.status !== "success") {
    return typeof status.error === "string" ? status.error : status.status;
  }
  return null;
}

export function getExecutedDigest(result: GrpcExecuteShape): string {
  const digest = result.Transaction?.digest;
  if (!digest) {
    const err = result.FailedTransaction?.status?.error?.message;
    throw new Error(err ?? "Transaction failed without digest");
  }
  return digest;
}

export function assertExecutedSuccess(result: GrpcExecuteShape): void {
  if (result.FailedTransaction) {
    throw new Error(
      result.FailedTransaction.status?.error?.message ?? "Transaction failed",
    );
  }
  const failed =
    statusFailure(result.Transaction?.status) ??
    statusFailure(result.Transaction?.effects?.status);
  if (failed) throw new Error(failed);
}
