"use client";

import { useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@the-domain/utils";
import { buttonClasses } from "./button";

export interface DialogProps {
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode | ((controls: { close: () => void; open: boolean }) => ReactNode);
  variant?: "default" | "media";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  titleVisuallyHidden?: boolean;
  closeLabel?: string;
}

export function Dialog({
  trigger,
  title,
  description,
  children,
  variant = "default",
  open: controlledOpen,
  onOpenChange,
  titleVisuallyHidden = false,
  closeLabel = "Close dialog",
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  function setOpen(nextOpen: boolean) {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <DialogPrimitive.Root onOpenChange={setOpen} open={open}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 border border-line shadow-2xl",
            variant === "media"
              ? "max-h-[calc(100svh-1rem)] w-[calc(100%-1rem)] max-w-[96rem] overflow-hidden bg-canvas/95 p-0 sm:max-h-[calc(100svh-2rem)] sm:w-[calc(100%-2rem)]"
              : "max-h-[90svh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto bg-surface-raised p-6 sm:p-8",
          )}
        >
          <DialogPrimitive.Title
            className={cn(
              "font-display text-2xl font-bold text-ink",
              titleVisuallyHidden && "sr-only",
            )}
          >
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description
              className={cn(
                "mt-3 text-sm leading-6 text-ink-muted",
                titleVisuallyHidden && "sr-only",
              )}
            >
              {description}
            </DialogPrimitive.Description>
          )}
          <div className={variant === "media" ? "h-full" : "mt-6"}>
            {typeof children === "function"
              ? children({ close: () => setOpen(false), open })
              : children}
          </div>
          <DialogPrimitive.Close
            className={buttonClasses(
              "ghost",
              "absolute right-3 top-3 z-20 min-h-10 border-line bg-canvas/80 px-3 text-ink backdrop-blur-md hover:border-gold sm:right-4 sm:top-4",
            )}
            aria-label={closeLabel}
          >
            Close
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
