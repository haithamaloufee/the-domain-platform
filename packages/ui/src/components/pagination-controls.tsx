import { Button } from "./button";
export interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrevious?: () => void;
  onNext?: () => void;
}
export function PaginationControls({
  page,
  totalPages,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-line pt-5"
    >
      <Button aria-label="Previous page" disabled={page <= 1} onClick={onPrevious}>
        Previous
      </Button>
      <span
        aria-live="polite"
        className="font-label text-xs uppercase tracking-[0.12em] text-ink-muted"
      >
        Page {page} of {totalPages}
      </span>
      <Button aria-label="Next page" disabled={page >= totalPages} onClick={onNext}>
        Next
      </Button>
    </nav>
  );
}
