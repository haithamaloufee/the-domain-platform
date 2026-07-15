"use client";

import type { LoginRequest } from "@the-domain/types";
import { FormField, InlineAlert, LoadingButton, PasswordInput, TextInput } from "@the-domain/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState, useSyncExternalStore } from "react";
import { getLoginErrorMessage, loginErrorMessages } from "@/lib/auth/login-errors";
import {
  type LoginField,
  type LoginFieldErrors,
  validateLoginCredentials,
} from "@/lib/auth/login-validation";
import {
  forgetRememberedEmail,
  readRememberedEmail as readRememberedEmailPreference,
  rememberEmail,
} from "@/lib/auth/remembered-email";

const rememberedEmailListeners = new Set<() => void>();

export function LoginForm({ initialMessage }: { initialMessage?: string }) {
  const router = useRouter();
  const storedEmail = useSyncExternalStore(
    subscribeToRememberedEmail,
    readRememberedEmail,
    emptyRememberedEmail,
  );
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [rememberEmailOverride, setRememberEmailOverride] = useState<boolean | null>(null);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState(initialMessage ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInFlight = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const formErrorRef = useRef<HTMLDivElement>(null);
  const email = emailOverride ?? storedEmail;
  const rememberEmail = rememberEmailOverride ?? Boolean(storedEmail);

  function updateField(field: LoginField, value: string) {
    if (field === "email") {
      setEmailOverride(value);
      if (rememberEmail) writeRememberedEmail(value);
    } else {
      setPassword(value);
    }

    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError("");
  }

  function updateRememberEmail(checked: boolean) {
    setRememberEmailOverride(checked);
    if (checked) writeRememberedEmail(email);
    else {
      setEmailOverride(email);
      removeRememberedEmail();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInFlight.current) return;

    const credentials: LoginRequest = { email: email.trim(), password };
    const errors = validateLoginCredentials(credentials);
    setFieldErrors(errors);
    setFormError("");

    const firstInvalidField = errors.email
      ? emailRef.current
      : errors.password
        ? passwordRef.current
        : null;
    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    if (rememberEmail) writeRememberedEmail(credentials.email);
    else removeRememberedEmail();

    submissionInFlight.current = true;
    setIsSubmitting(true);
    let authenticated = false;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        showFormError(getLoginErrorMessage(response.status));
        return;
      }

      authenticated = true;
      router.replace("/dashboard");
      router.refresh();
    } catch {
      showFormError(loginErrorMessages.serviceUnavailable);
    } finally {
      if (!authenticated) {
        submissionInFlight.current = false;
        setIsSubmitting(false);
      }
    }
  }

  function showFormError(message: string) {
    setFormError(message);
    requestAnimationFrame(() => formErrorRef.current?.focus());
  }

  return (
    <form className="mt-8 space-y-5" noValidate onSubmit={(event) => void handleSubmit(event)}>
      {formError && (
        <InlineAlert ref={formErrorRef} tabIndex={-1} tone="error">
          {formError}
        </InlineAlert>
      )}

      <FormField
        disabled={isSubmitting}
        error={fieldErrors.email}
        id="admin-email"
        label="Email address"
        required
        reserveMessageSpace
      >
        {(controlProps) => (
          <TextInput
            {...controlProps}
            autoCapitalize="none"
            autoComplete="username"
            inputMode="email"
            leading={<span className="font-label text-sm">@</span>}
            maxLength={320}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="name@example.com"
            ref={emailRef}
            spellCheck={false}
            type="email"
            value={email}
          />
        )}
      </FormField>

      <FormField
        disabled={isSubmitting}
        error={fieldErrors.password}
        id="admin-password"
        label="Password"
        required
        reserveMessageSpace
      >
        {(controlProps) => (
          <PasswordInput
            {...controlProps}
            autoComplete="current-password"
            maxLength={1024}
            onChange={(event) => updateField("password", event.target.value)}
            ref={passwordRef}
            value={password}
          />
        )}
      </FormField>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink-muted">
        <input
          checked={rememberEmail}
          className="size-4 shrink-0 accent-[var(--td-color-gold)]"
          disabled={isSubmitting}
          onChange={(event) => updateRememberEmail(event.target.checked)}
          type="checkbox"
        />
        <span>Remember my email</span>
      </label>

      <LoadingButton
        className="w-full"
        disabled={isSubmitting}
        pending={isSubmitting}
        pendingLabel="Signing in…"
        type="submit"
      >
        Sign in securely
      </LoadingButton>

      <p className="text-center text-xs leading-5 text-ink-muted">
        Authorized staff access only. Sign-in activity may be monitored for security.
      </p>
    </form>
  );
}

function readRememberedEmail(): string {
  return readRememberedEmailPreference();
}

function emptyRememberedEmail(): string {
  return "";
}

function subscribeToRememberedEmail(onStoreChange: () => void): () => void {
  rememberedEmailListeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    rememberedEmailListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function notifyRememberedEmailListeners(): void {
  rememberedEmailListeners.forEach((listener) => listener());
}

function writeRememberedEmail(email: string): void {
  rememberEmail(email);
  notifyRememberedEmailListeners();
}

function removeRememberedEmail(): void {
  forgetRememberedEmail();
  notifyRememberedEmailListeners();
}
