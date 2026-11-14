"use client";

import type { KeyboardEvent } from "react";
import { forwardRef, useId, useState } from "react";
import { cn } from "@the-domain/utils";
import { TextInput, type TextInputProps } from "./text-input";

export interface PasswordInputProps extends Omit<TextInputProps, "type" | "trailing"> {
  capsLockMessage?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      "aria-describedby": ariaDescribedBy,
      capsLockMessage = "Caps Lock is on.",
      disabled,
      onBlur,
      onKeyDown,
      onKeyUp,
      ...props
    },
    ref,
  ) {
    const [isVisible, setIsVisible] = useState(false);
    const [isCapsLockOn, setIsCapsLockOn] = useState(false);
    const capsLockId = useId();
    const describedBy = [ariaDescribedBy, isCapsLockOn ? capsLockId : undefined]
      .filter(Boolean)
      .join(" ");

    function updateCapsLock(event: KeyboardEvent<HTMLInputElement>) {
      setIsCapsLockOn(event.getModifierState("CapsLock"));
    }

    return (
      <div>
        <TextInput
          {...props}
          aria-describedby={describedBy || undefined}
          disabled={disabled}
          onBlur={(event) => {
            setIsCapsLockOn(false);
            onBlur?.(event);
          }}
          onKeyDown={(event) => {
            updateCapsLock(event);
            onKeyDown?.(event);
          }}
          onKeyUp={(event) => {
            updateCapsLock(event);
            onKeyUp?.(event);
          }}
          ref={ref}
          trailing={
            <button
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-ink-muted transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
              onClick={() => setIsVisible((current) => !current)}
              type="button"
            >
              {isVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          }
          type={isVisible ? "text" : "password"}
        />
        <p
          aria-live="polite"
          className={cn("min-h-5 pt-2 text-xs leading-5 text-gold", !isCapsLockOn && "invisible")}
          id={capsLockId}
          role="status"
        >
          {capsLockMessage}
        </p>
      </div>
    );
  },
);

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="m4 4 16 16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path
        d="M9.5 6.35A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.2 2.85M6.2 7.65C3.82 9.37 2.5 12 2.5 12s3.5 6 9.5 6c1.15 0 2.2-.22 3.14-.58"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
