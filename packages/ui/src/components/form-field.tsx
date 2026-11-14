import type { ReactNode } from "react";
import { cn } from "@the-domain/utils";

export interface FormFieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  disabled?: boolean;
  required?: boolean;
}

export interface FormFieldProps {
  children: (controlProps: FormFieldControlProps) => ReactNode;
  className?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  id: string;
  label: string;
  required?: boolean;
  reserveMessageSpace?: boolean;
}

export function FormField({
  children,
  className,
  disabled = false,
  error,
  helperText,
  id,
  label,
  required = false,
  reserveMessageSpace = false,
}: FormFieldProps) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", disabled && "opacity-70", className)}>
      <label
        className="block font-label text-xs font-semibold uppercase tracking-[0.12em] text-ink"
        htmlFor={id}
      >
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-1 text-gold">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        disabled,
        required,
      })}
      <div className={cn("space-y-1", reserveMessageSpace && "min-h-5")}>
        {helperText && (
          <p className="text-xs leading-5 text-ink-muted" id={helperId}>
            {helperText}
          </p>
        )}
        {error && (
          <p className="text-sm leading-5 text-error" id={errorId}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
