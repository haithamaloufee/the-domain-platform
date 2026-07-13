import type { ButtonHTMLAttributes } from "react";
import { cn } from "@the-domain/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export function buttonClasses(variant: ButtonVariant = "primary", className?: string): string {
  return cn(
    "inline-flex min-h-11 items-center justify-center border px-5 font-label text-xs font-semibold uppercase tracking-[0.12em] transition focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "primary" && "border-gold bg-gold text-canvas hover:bg-gold-bright",
    variant === "secondary" &&
      "border-line bg-transparent text-ink hover:border-gold hover:text-gold",
    variant === "ghost" && "border-transparent bg-transparent text-ink-muted hover:text-ink",
    className,
  );
}

export function Button({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClasses("primary", className)} type={type} {...props} />;
}
