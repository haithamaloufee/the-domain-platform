export function EventCardSkeleton() {
  return (
    <div aria-label="Loading event" className="animate-pulse" role="status">
      <div className="aspect-[2/3] border border-line bg-surface-raised" />
      <div className="mt-5 h-3 w-24 bg-surface-high" />
      <div className="mt-3 h-7 w-3/4 bg-surface-high" />
    </div>
  );
}
