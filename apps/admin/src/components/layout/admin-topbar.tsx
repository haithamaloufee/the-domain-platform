export function AdminTopbar() {
  return (
    <header className="flex min-h-20 items-center justify-between border-b border-line px-gutter">
      <div>
        <p className="font-label text-[0.625rem] uppercase tracking-[0.16em] text-gold">
          Administration
        </p>
        <p className="mt-1 text-sm text-ink-muted">Content operations foundation</p>
      </div>
      <div
        aria-label="Account placeholder"
        className="grid size-10 place-items-center border border-line font-label text-xs text-ink"
      >
        TD
      </div>
    </header>
  );
}
