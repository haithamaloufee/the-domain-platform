import type { HTMLAttributes } from "react";
import { cn } from "@the-domain/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex border border-line px-2.5 py-1 font-label text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}
