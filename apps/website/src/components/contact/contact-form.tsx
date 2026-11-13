"use client";

import { Button } from "@the-domain/ui";
import { useState, type FormEvent } from "react";

const fieldClass = "w-full border border-line bg-surface px-4 py-3 text-ink focus:border-gold";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setError("");
    setSent(false);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) {
        const { message } = (await response.json()) as { message?: string };
        throw new Error(message || "Your message could not be sent.");
      }
      form.reset();
      setSent(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Your message could not be sent.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-6" onSubmit={submit}>
      <label className="grid gap-2">
        Name
        <input
          autoComplete="name"
          className={fieldClass}
          maxLength={120}
          minLength={2}
          name="name"
          required
        />
      </label>
      <label className="grid gap-2">
        Email
        <input
          autoComplete="email"
          className={fieldClass}
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="grid gap-2">
        Tell us what you have in mind
        <textarea
          className={fieldClass}
          maxLength={3000}
          minLength={10}
          name="message"
          required
          rows={5}
        />
      </label>
      <div hidden>
        <label>
          Website <input autoComplete="off" name="website" tabIndex={-1} />
        </label>
      </div>
      <p className="text-sm text-ink-muted">We use these details to respond to your enquiry.</p>
      {error && (
        <p className="text-error" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <p className="text-ink" role="status">
          Your message has been received.
        </p>
      )}
      <Button className="justify-self-start" disabled={pending} type="submit">
        {pending ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
