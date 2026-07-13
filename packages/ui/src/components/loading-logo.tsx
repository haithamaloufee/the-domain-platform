export function LoadingLogo() {
  return (
    <div aria-label="Loading" className="inline-flex items-center gap-3" role="status">
      <span className="grid size-9 animate-pulse place-items-center border border-gold font-display text-sm font-bold text-gold">
        D
      </span>
      <span className="font-label text-xs uppercase tracking-[0.18em] text-ink-muted">Loading</span>
    </div>
  );
}
