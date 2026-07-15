import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@the-domain/utils";

const fieldClass =
  "w-full border-0 border-b border-line bg-transparent px-0 py-3 text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-gold aria-[invalid=true]:border-error aria-[invalid=true]:focus:border-error disabled:cursor-not-allowed disabled:opacity-50";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, "min-h-28 resize-y", className)} {...props} />;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

export function Select({ className, children, placeholder, ...props }: SelectProps) {
  return (
    <select className={cn(fieldClass, className)} {...props}>
      {placeholder && (
        <option disabled value="">
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
}
