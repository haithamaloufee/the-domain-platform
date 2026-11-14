import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@the-domain/utils";
import { buttonClasses, type ButtonVariant } from "./button";

export interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
  pendingLabel: string;
  variant?: ButtonVariant;
}

export function LoadingButton({
  children,
  className,
  disabled,
  pending = false,
  pendingLabel,
  type = "button",
  variant = "primary",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      aria-busy={pending}
      className={buttonClasses(variant, cn("relative", className))}
      disabled={disabled || pending}
      type={type}
      {...props}
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="mr-2 size-4 animate-spin border-2 border-current border-r-transparent"
          />
          <span>{pendingLabel}</span>
        </>
      ) : (
        (children as ReactNode)
      )}
    </button>
  );
}
