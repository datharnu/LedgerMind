const LINE_WIDTHS = ["92%", "64%", "80%", "48%"];

export function LoadingState({
  label,
  rows = 3,
  variant = "lines",
}: {
  label: string;
  rows?: number;
  variant?: "lines" | "cards";
}) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <p className="sr-only">{label}</p>
      {variant === "cards" ? (
        <div className="skeleton-cards">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="skeleton-card" aria-hidden="true">
              <div className="skeleton skeleton-line" style={{ width: "58%" }} />
              <div className="skeleton skeleton-line" style={{ width: "32%" }} />
              <div className="skeleton-actions">
                <div className="skeleton skeleton-btn" />
                <div className="skeleton skeleton-btn" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="skeleton-lines" aria-hidden="true">
          {Array.from({ length: rows }, (_, i) => (
            <div
              key={i}
              className="skeleton skeleton-line"
              style={{ width: LINE_WIDTHS[i % LINE_WIDTHS.length] }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
