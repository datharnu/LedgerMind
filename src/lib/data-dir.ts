import path from "node:path";
import { tmpdir } from "node:os";

/**
 * Local dev writes next to the app, in `data/`.
 *
 * Old wrong behavior: `mkdir(path.join(process.cwd(), "data"))`.
 * On Vercel, cwd is `/var/task` and that mkdir throws
 * `ENOENT: no such file or directory, mkdir '/var/task/data'`.
 * The function filesystem only accepts writes under `/tmp`.
 * That directory dies with the instance, so a cold start starts an empty tape.
 */
export function dataDir(): string {
  const override = process.env.LEDGERMIND_DATA_DIR;
  if (override) return override;
  if (process.env.VERCEL) {
    return path.join(tmpdir(), "ledgermind");
  }
  return path.join(process.cwd(), "data");
}
