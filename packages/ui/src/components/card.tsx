import type { HTMLAttributes } from "react";
import { cn } from "@the-domain/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border border-line bg-surface-raised", className)} {...props} />;
}
