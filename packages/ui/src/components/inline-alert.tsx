import type { HTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@the-domain/utils";

export type InlineAlertTone = "info" | "warning" | "error" | "success";

export interface InlineAlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: InlineAlertTone;
}

const toneClasses: Record<InlineAlertTone, string> = {
  info: "border-info bg-info/10 text-ink",
  warning: "border-warning bg-warning/10 text-ink",
  error: "border-error bg-error/10 text-error",
  success: "border-success bg-success/10 text-ink",
};

export const InlineAlert = forwardRef<HTMLDivElement, InlineAlertProps>(function InlineAlert(
  { children, className, role, tone = "info", ...props },
  ref,
) {
  return (
    <div
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={cn("border-l-2 px-4 py-3 text-sm leading-6", toneClasses[tone], className)}
      ref={ref}
      role={role ?? (tone === "error" ? "alert" : "status")}
      {...props}
    >
      {children}
    </div>
  );
});
