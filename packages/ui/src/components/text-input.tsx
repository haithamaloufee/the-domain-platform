import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "@the-domain/utils";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    "aria-invalid": ariaInvalid,
    className,
    containerClassName,
    disabled,
    leading,
    trailing,
    ...props
  },
  ref,
) {
  return (
    <div
      className={cn(
        "group flex min-h-12 items-center border border-line bg-surface px-4 transition-colors focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/35",
        ariaInvalid && "border-error focus-within:border-error focus-within:ring-error/30",
        disabled && "cursor-not-allowed opacity-55",
        containerClassName,
      )}
    >
      {leading && (
        <span aria-hidden="true" className="mr-3 shrink-0 text-ink-muted">
          {leading}
        </span>
      )}
      <input
        className={cn(
          "min-w-0 flex-1 border-0 bg-transparent py-3 text-base text-ink outline-none placeholder:text-ink-muted/60 disabled:cursor-not-allowed",
          className,
        )}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        ref={ref}
        {...props}
      />
      {trailing && <span className="ml-2 flex shrink-0 items-center">{trailing}</span>}
    </div>
  );
});
