import { cn } from "@the-domain/utils";

export function BrandedLoader({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-label="Loading The Domain"
      className={cn(
        "flex items-center justify-center bg-canvas",
        compact ? "min-h-52" : "min-h-[calc(100svh-5rem)]",
      )}
      role="status"
    >
      <div className="w-full max-w-xs px-6 text-center">
        <div className="brand-loader-pulse font-display text-2xl font-extrabold tracking-[-0.04em] text-ink sm:text-3xl">
          THE DOMAIN<span className="text-gold">.</span>
        </div>
        <div aria-hidden="true" className="relative mx-auto mt-6 h-px w-40 overflow-hidden bg-line">
          <span className="brand-loader-sweep absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
        <p className="mt-5 font-label text-[0.625rem] uppercase tracking-[0.22em] text-ink-muted">
          Framing the experience
        </p>
      </div>
    </div>
  );
}
