import type { CSSProperties } from "react";

export type TapeTone = "ok" | "error" | "alarm";
export type TapeStep = {
  step: number;
  at: number;
  tool: string;
  tone: TapeTone;
  flag?: string;
};

const LANDING_STEPS: TapeStep[] = [
  { step: 1, at: 0, tool: "query_price", tone: "ok" },
  { step: 2, at: 1800, tool: "log_spending", tone: "ok" },
  { step: 3, at: 3600, tool: "suggest", tone: "ok" },
  {
    step: 4,
    at: 5400,
    tool: "read_card",
    tone: "alarm",
    flag: "BLOCK",
  },
];

const NICE_SECONDS = [1, 2, 5, 10, 15, 30, 60, 120];

function tickLabel(seconds: number): string {
  if (seconds === 0) return "T+0";
  if (seconds < 60) return `+${seconds}s`;
  return `+${Math.floor(seconds / 60)}m`;
}

function layoutTape(steps: TapeStep[]) {
  const times = steps.map((item) => item.at);
  const start = Math.min(...times);
  const span = Math.max(Math.max(...times) - start, 1000);
  const channels = [...new Set(steps.map((item) => item.tool))];
  const placed = steps.map((item) => ({
    ...item,
    x: ((item.at - start) / span) * 100,
    y: ((channels.indexOf(item.tool) + 0.5) / channels.length) * 100,
    lane: 0,
  }));
  const spanSeconds = span / 1000;
  const interval =
    NICE_SECONDS.find((value) => spanSeconds / value <= 6) ?? 60;
  const ticks: { label: string; x: number }[] = [];
  for (let s = 0; s <= spanSeconds + 1e-9; s += interval) {
    ticks.push({ label: tickLabel(s), x: (s / spanSeconds) * 100 });
  }
  return { channels, marks: placed, ticks };
}

export function ReceiptTape({ steps = LANDING_STEPS }: { steps?: TapeStep[] }) {
  if (!steps.length) return null;
  const { channels, marks, ticks } = layoutTape(steps);
  const flags = marks.filter((m) => m.flag);
  const trace = marks
    .map((mark, index) =>
      index === 0
        ? `M${mark.x.toFixed(3)} ${mark.y.toFixed(3)}`
        : `H${mark.x.toFixed(3)} V${mark.y.toFixed(3)}`,
    )
    .join(" ");

  return (
    <div
      className="tape tape-light"
      role="img"
      aria-label="Receipt tape: query, memory, suggest, blocked card read"
      style={{ "--rows": channels.length } as CSSProperties}
    >
      <div className="tape-body">
        {flags.length > 0 && (
          <div className="tape-flags" aria-hidden>
            {flags.map((mark) => (
              <span
                key={`flag-${mark.step}`}
                className={`tape-flag${mark.x > 62 ? " at-end" : ""}`}
                style={{ left: `${mark.x}%` }}
              >
                <i />
                {mark.flag}
              </span>
            ))}
          </div>
        )}
        <div className="tape-labels" aria-hidden>
          {channels.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
        <div className="tape-plot" aria-hidden>
          {channels.map((name) => (
            <div key={name} className="tape-row" />
          ))}
          <svg
            className="tape-trace"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path d={trace} />
          </svg>
          {marks
            .filter((mark) => mark.flag)
            .map((mark) => (
              <div
                key={`band-${mark.step}`}
                className="tape-band"
                style={{ left: `${mark.x}%` }}
              />
            ))}
          {marks.map((mark) => (
            <span
              key={mark.step}
              className={`tape-mark is-${mark.tone}`}
              style={{
                left: `${mark.x}%`,
                top: `${mark.y}%`,
              }}
            >
              {String(mark.step).padStart(2, "0")}
            </span>
          ))}
        </div>
      </div>
      <div className="tape-axis" aria-hidden>
        {ticks.map((tick, index) => (
          <span
            key={tick.label}
            className={
              index === 0 ? "is-start" : tick.x > 94 ? "is-end" : undefined
            }
            style={{ left: `${tick.x}%` }}
          >
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
}
