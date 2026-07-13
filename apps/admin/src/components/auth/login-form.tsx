"use client";

import type { AuthErrorResponse, LoginRequest } from "@the-domain/types";
import { Button, Input } from "@the-domain/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm({ initialMessage }: { initialMessage?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialMessage ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const credentials: LoginRequest = { email: email.trim(), password };
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const result = (await response.json()) as AuthErrorResponse;
        setError(result.message || "Unable to sign in. Please try again.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-9 space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="font-label text-xs uppercase tracking-[0.1em]" htmlFor="email">
          Email
        </label>
        <Input
          autoComplete="email"
          autoFocus
          disabled={isSubmitting}
          id="email"
          inputMode="email"
          maxLength={320}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>
      <div>
        <label className="font-label text-xs uppercase tracking-[0.1em]" htmlFor="password">
          Password
        </label>
        <Input
          autoComplete="current-password"
          disabled={isSubmitting}
          id="password"
          maxLength={1024}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      <p aria-live="polite" className="min-h-6 text-sm leading-6 text-error" role="alert">
        {error}
      </p>
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
