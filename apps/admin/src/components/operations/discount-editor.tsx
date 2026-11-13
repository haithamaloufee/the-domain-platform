"use client";

import type { AdminEventListItem } from "@the-domain/types";
import { Button } from "@the-domain/ui";
import { useEffect, useState, type FormEvent } from "react";
import { listAdminEvents } from "@/lib/events/admin-events-client";
import { operationsRequest } from "@/lib/operations";

type Promotion = { enabled: boolean; percent: number | null; text: string | null };
const input = "min-h-11 w-full border border-line bg-canvas px-3 py-2";

export function DiscountEditor() {
  const [events, setEvents] = useState<AdminEventListItem[] | null>(null);
  const [id, setId] = useState("");
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    listAdminEvents().then(
      (items) => {
        if (active) setEvents(items);
      },
      (failure: Error) => {
        if (active) setError(failure.message);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    operationsRequest<Promotion>(`promotions/${id}`).then(
      (result) => {
        if (active) setPromotion(result);
      },
      (failure: Error) => {
        if (active) setError(failure.message);
      },
    );
    return () => {
      active = false;
    };
  }, [id]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setPending(true);
    setSaved(false);
    setError("");
    try {
      await operationsRequest(`promotions/${id}`, "PUT", {
        enabled: values.get("enabled") === "on",
        percent: values.get("percent") ? Number(values.get("percent")) : null,
        text: values.get("text") || null,
      });
      setSaved(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to save this discount.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-5">
      <label className="grid gap-2">
        Event
        <select
          className={input}
          disabled={pending || !events}
          value={id}
          onChange={(event) => {
            setId(event.target.value);
            setPromotion(null);
            setError("");
            setSaved(false);
          }}
        >
          <option value="">{events ? "Select an event" : "Loading events…"}</option>
          {events?.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </label>
      {id && !promotion && !error && <p role="status">Loading discount…</p>}
      {promotion && (
        <form className="grid gap-5 border border-line bg-surface p-5" key={id} onSubmit={save}>
          <label className="flex min-h-11 items-center gap-3">
            <input name="enabled" defaultChecked={promotion.enabled} type="checkbox" /> Enable for
            this event
          </label>
          <label className="grid gap-2">
            Discount percentage
            <input
              className={input}
              name="percent"
              defaultValue={promotion.percent ?? ""}
              type="number"
              min={1}
              max={100}
            />
          </label>
          <label className="grid gap-2">
            Public terms
            <textarea
              className={input}
              name="text"
              defaultValue={promotion.text ?? ""}
              maxLength={500}
              rows={4}
            />
          </label>
          <Button className="justify-self-start" disabled={pending} type="submit">
            {pending ? "Saving…" : "Save discount"}
          </Button>
        </form>
      )}
      {error && (
        <p className="text-error" role="alert">
          {error}
        </p>
      )}
      {saved && <p role="status">Discount saved.</p>}
    </div>
  );
}
