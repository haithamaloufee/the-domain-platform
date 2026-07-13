"use client";

import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { buttonClasses } from "./button";

export interface DialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Dialog({ trigger, title, description, children }: DialogProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-line bg-surface-raised p-6 shadow-2xl sm:p-8">
          <DialogPrimitive.Title className="font-display text-2xl font-bold text-ink">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-3 text-sm leading-6 text-ink-muted">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className="mt-6">{children}</div>
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
