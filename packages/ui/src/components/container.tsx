import type { HTMLAttributes } from "react";
import { cn } from "@the-domain/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-container px-gutter", className)} {...props} />;
}
