import { Mark } from "@/components/brand";

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

export function PageLoading({ label }: { label: string }) {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <span className="spinner spinner-lg" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function BrandLoading({ label }: { label: string }) {
  return (
    <div className="brand-loading" role="status" aria-live="polite">
      <div className="brand-loading-lockup">
        <span className="brand-loading-glyph" aria-hidden="true">
          <Mark />
        </span>
      </div>
      <p className="sr-only">{label}</p>
    </div>
  );
}
