"use client";

import { buttonClasses, EmptyState } from "@the-domain/ui";
import { useEffect, useState } from "react";
import { operationsRequest } from "@/lib/operations";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAtUtc: string;
  readAtUtc: string | null;
}

const dateFormat = new Intl.DateTimeFormat("en-JO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Amman",
});

export function MessageInbox() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    operationsRequest<Message[]>(`messages?offset=${offset}`).then(
      (items) => {
        if (active) setMessages(items);
      },
      (failure: Error) => {
        if (active) setError(failure.message);
      },
    );
    return () => {
      active = false;
    };
  }, [offset]);

  async function markRead(id: string) {
    setBusy(id);
    setError("");
    try {
      await operationsRequest(`messages/${id}/read`, "POST");
      setMessages(
        (items) =>
          items?.map((item) =>
            item.id === id ? { ...item, readAtUtc: new Date().toISOString() } : item,
          ) ?? null,
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to mark the message as read.");
    } finally {
      setBusy(null);
    }
  }

  function paginate(value: number) {
    setMessages(null);
    setError("");
    setOffset(value);
  }

  return (
    <div className="grid gap-4">
      {error && (
        <p role="alert" className="text-error">
          {error}
        </p>
      )}
      {!messages && !error && <p role="status">Loading messages…</p>}
      {messages?.length === 0 && (
        <EmptyState
          title="No messages on this page"
          description="New website enquiries appear here."
        />
      )}
      {messages?.map((item) => (
        <article className="grid gap-4 border border-line bg-surface p-5 sm:p-7" key={item.id}>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <span className="break-all text-sm text-ink-muted">{item.email}</span>
            </div>
            <time className="text-sm text-ink-muted" dateTime={item.createdAtUtc}>
              {dateFormat.format(new Date(item.createdAtUtc))}
            </time>
          </header>
          <p className="whitespace-pre-wrap break-words">{item.message}</p>
          {!item.readAtUtc && (
            <button
              className={buttonClasses("secondary", "justify-self-start")}
              disabled={busy !== null}
              onClick={() => void markRead(item.id)}
            >
              {busy === item.id ? "Saving…" : "Mark as read"}
            </button>
          )}
        </article>
      ))}
      {messages && (offset > 0 || messages.length === 25) && (
        <nav className="flex gap-3" aria-label="Message pages">
          <button
            className={buttonClasses("secondary")}
            disabled={offset === 0 || busy !== null}
            onClick={() => paginate(offset - 25)}
          >
            Previous
          </button>
          <button
            className={buttonClasses("secondary")}
            disabled={messages.length < 25 || busy !== null}
            onClick={() => paginate(offset + 25)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
