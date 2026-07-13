import type { HTMLAttributes } from "react";
import { cn } from "@the-domain/utils";
export function MediaFrame({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-line bg-surface-raised [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>video]:h-full [&>video]:w-full [&>video]:object-cover",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
