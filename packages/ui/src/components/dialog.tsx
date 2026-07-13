"use client";

import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@the-domain/utils";
import { buttonClasses } from "./button";

export interface DialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "media";
}

export function Dialog({
  trigger,
  title,
  description,
  children,
  variant = "default",
}: DialogProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[90svh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-line bg-surface-raised shadow-2xl",
            variant === "media" ? "max-w-5xl p-4 sm:p-6" : "max-w-xl p-6 sm:p-8",
          )}
        >
          <DialogPrimitive.Title className="font-display text-2xl font-bold text-ink">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-3 text-sm leading-6 text-ink-muted">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className={variant === "media" ? "mt-4" : "mt-6"}>{children}</div>
          <DialogPrimitive.Close
            className={buttonClasses("ghost", "absolute right-3 top-3 min-h-9 px-3")}
            aria-label="Close dialog"
          >
            Close
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
