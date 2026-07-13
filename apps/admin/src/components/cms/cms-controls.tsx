"use client";

import { Badge, buttonClasses } from "@the-domain/ui";
import { cn } from "@the-domain/utils";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function CmsField({
  children,
  error,
  hint,
  label,
  name,
  required = false,
}: {
  children: ReactNode;
  error?: string;
  hint?: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  const descriptionId = error ? `${name}-error` : hint ? `${name}-hint` : undefined;
  return (
    <div>
      <label
        className="font-label text-xs font-semibold uppercase tracking-[0.12em] text-ink"
        htmlFor={name}
      >
        {label}
        {required && (
          <span className="ml-1 text-gold" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="mt-1" aria-describedby={descriptionId}>
        {children}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-error" id={`${name}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-xs leading-5 text-ink-muted" id={`${name}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function CmsCheckbox({
  checked,
  description,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  description?: string;
  label: string;
  name: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-start gap-3 border border-line bg-surface px-4 py-3 text-sm text-ink transition hover:border-gold">
      <input
        checked={checked}
        className="mt-0.5 size-4 shrink-0 accent-[var(--td-color-gold)]"
        name={name}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span>
        <span className="block font-semibold">{label}</span>
        {description && (
          <span className="mt-1 block text-xs leading-5 text-ink-muted">{description}</span>
        )}
      </span>
    </label>
  );
}

export function CmsFeedback({ message, tone }: { message: string; tone: "error" | "success" }) {
  if (!message) return null;
  return (
    <p
      className={cn(
        "border-l-2 px-4 py-3 text-sm",
        tone === "error"
          ? "border-error bg-error/10 text-error"
          : "border-gold bg-gold/10 text-ink",
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </p>
  );
}

export function CmsStatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <Badge className={active ? "border-gold text-gold" : "border-line text-ink-muted"}>
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}

export function ConfirmAction({
  description,
  label,
  onConfirm,
  pendingLabel = "Working…",
  title,
  variant = "ghost",
}: {
  description: string;
  label: string;
  onConfirm: () => Promise<void>;
  pendingLabel?: string;
  title: string;
  variant?: "secondary" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  function close() {
    if (pending) return;
    setOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  }

  async function confirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
      queueMicrotask(() => triggerRef.current?.focus());
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        className={buttonClasses(variant, "min-h-10 px-3")}
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        {label}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-canvas/85 p-4 backdrop-blur-sm"
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
          }}
        >
          <div
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            aria-modal="true"
            className="w-full max-w-lg border border-line bg-surface-raised p-6 sm:p-8"
            role="alertdialog"
          >
            <h2 className="font-display text-2xl font-bold text-ink" id={titleId}>
              {title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-muted" id={descriptionId}>
              {description}
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className={buttonClasses("ghost")}
                disabled={pending}
                onClick={close}
                type="button"
              >
                Cancel
              </button>
              <button
                className={buttonClasses("primary")}
                disabled={pending}
                onClick={() => void confirm()}
                ref={confirmRef}
                type="button"
              >
                {pending ? pendingLabel : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
