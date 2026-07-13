"use client";

import type { AdminEventDetails, SaveEventRequest } from "@the-domain/types";
import { buttonClasses, Card, Input, Textarea } from "@the-domain/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAdminEvent, updateAdminEvent } from "@/lib/events/admin-events-client";

type FormFields = Omit<
  SaveEventRequest,
  "startAtUtc" | "endAtUtc" | "bookingOpensAtUtc" | "bookingClosesAtUtc"
> & {
  startAtUtc: string;
  endAtUtc: string;
  bookingOpensAtUtc: string;
  bookingClosesAtUtc: string;
};

type FieldErrors = Partial<Record<keyof FormFields, string>>;

interface EventFormProps {
  event?: AdminEventDetails;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const [fields, setFields] = useState<FormFields>(() => initialFields(event));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(event);

  function update<K extends keyof FormFields>(name: K, value: FormFields[K]) {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function submit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const validationErrors = validate(fields);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setSubmitError("Please correct the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const request = toRequest(fields);
      const saved = event
        ? await updateAdminEvent(event.id, request)
        : await createAdminEvent(request);
      router.push(`/dashboard/events/${saved.id}`);
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save this event.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" noValidate onSubmit={(formEvent) => void submit(formEvent)}>
      {submitError && (
        <p
          className="border-l-2 border-error bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {submitError}
        </p>
      )}

      <Card className="p-6 sm:p-8">
        <FormSection
          description="The public identity and editorial copy for this event."
          title="Event identity"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Field error={errors.title} label="Title" name="title" required>
              <Input
                id="title"
                maxLength={200}
                onChange={(e) => update("title", e.target.value)}
                value={fields.title}
              />
            </Field>
            <Field
              error={errors.slug}
              hint="Lowercase letters, numbers, and hyphens."
              label="Slug"
              name="slug"
              required
            >
              <Input
                id="slug"
                maxLength={200}
                onChange={(e) => update("slug", e.target.value)}
                value={fields.slug}
              />
            </Field>
            <Field error={errors.eventType} label="Event type" name="eventType" required>
              <Input
                id="eventType"
                maxLength={100}
                onChange={(e) => update("eventType", e.target.value)}
                placeholder="Concert, nightlife, corporate…"
                value={fields.eventType}
              />
            </Field>
            <Field
              error={errors.shortDescription}
              label="Short description"
              name="shortDescription"
            >
              <Textarea
                className="min-h-24"
                id="shortDescription"
                maxLength={500}
                onChange={(e) => update("shortDescription", e.target.value)}
                value={fields.shortDescription}
              />
            </Field>
          </div>
          <Field error={errors.longDescription} label="Long description" name="longDescription">
            <Textarea
              className="min-h-40"
              id="longDescription"
              maxLength={10_000}
              onChange={(e) => update("longDescription", e.target.value)}
              value={fields.longDescription}
            />
          </Field>
        </FormSection>
      </Card>

      <Card className="p-6 sm:p-8">
        <FormSection
          description="Times are entered in your device’s local time and stored as UTC."
          title="Schedule"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Field error={errors.startAtUtc} label="Starts" name="startAtUtc" required>
              <Input
                id="startAtUtc"
                onChange={(e) => update("startAtUtc", e.target.value)}
                type="datetime-local"
                value={fields.startAtUtc}
              />
            </Field>
            <Field error={errors.endAtUtc} label="Ends" name="endAtUtc" required>
              <Input
                id="endAtUtc"
                onChange={(e) => update("endAtUtc", e.target.value)}
                type="datetime-local"
                value={fields.endAtUtc}
              />
            </Field>
            <Field
              error={errors.timeZoneId}
              hint="IANA identifier used when displaying the event."
              label="Time zone"
              name="timeZoneId"
              required
            >
              <Input
                id="timeZoneId"
                maxLength={100}
                onChange={(e) => update("timeZoneId", e.target.value)}
                value={fields.timeZoneId}
              />
            </Field>
          </div>
        </FormSection>
      </Card>

      <Card className="p-6 sm:p-8">
        <FormSection
          description="Venue information shown across event listings and details."
          title="Location"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <Field error={errors.city} label="City" name="city" required>
              <Input
                id="city"
                maxLength={100}
                onChange={(e) => update("city", e.target.value)}
                value={fields.city}
              />
            </Field>
            <Field error={errors.venueName} label="Venue name" name="venueName" required>
              <Input
                id="venueName"
                maxLength={200}
                onChange={(e) => update("venueName", e.target.value)}
                value={fields.venueName}
              />
            </Field>
            <Field error={errors.venueAddress} label="Venue address" name="venueAddress">
              <Input
                id="venueAddress"
                maxLength={500}
                onChange={(e) => update("venueAddress", e.target.value)}
                value={fields.venueAddress ?? ""}
              />
            </Field>
            <Field error={errors.mapUrl} label="Map URL" name="mapUrl">
              <Input
                id="mapUrl"
                onChange={(e) => update("mapUrl", e.target.value)}
                placeholder="https://…"
                type="url"
                value={fields.mapUrl ?? ""}
              />
            </Field>
          </div>
        </FormSection>
      </Card>

      <Card className="p-6 sm:p-8">
        <FormSection
          description="Booking remains external. The Domain does not process tickets in this platform."
          title="External booking"
        >
          <Checkbox
            checked={fields.isBookingEnabled}
            label="Enable booking CTA"
            name="isBookingEnabled"
            onChange={(value) => update("isBookingEnabled", value)}
          />
          <div className="grid gap-6 md:grid-cols-2">
            <Field
              error={errors.externalBookingUrl}
              label="External booking URL"
              name="externalBookingUrl"
            >
              <Input
                disabled={!fields.isBookingEnabled}
                id="externalBookingUrl"
                onChange={(e) => update("externalBookingUrl", e.target.value)}
                placeholder="https://…"
                type="url"
                value={fields.externalBookingUrl ?? ""}
              />
            </Field>
            <div aria-hidden="true" className="hidden md:block" />
            <Field error={errors.bookingOpensAtUtc} label="Booking opens" name="bookingOpensAtUtc">
              <Input
                disabled={!fields.isBookingEnabled}
                id="bookingOpensAtUtc"
                onChange={(e) => update("bookingOpensAtUtc", e.target.value)}
                type="datetime-local"
                value={fields.bookingOpensAtUtc}
              />
            </Field>
            <Field
              error={errors.bookingClosesAtUtc}
              label="Booking closes"
              name="bookingClosesAtUtc"
            >
              <Input
                disabled={!fields.isBookingEnabled}
                id="bookingClosesAtUtc"
                onChange={(e) => update("bookingClosesAtUtc", e.target.value)}
                type="datetime-local"
                value={fields.bookingClosesAtUtc}
              />
            </Field>
          </div>
        </FormSection>
      </Card>

      <Card className="p-6 sm:p-8">
        <FormSection
          description="Control how the event is promoted after it is published."
          title="Placement"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Checkbox
              checked={fields.isFeatured}
              label="Feature this event"
              name="isFeatured"
              onChange={(value) => update("isFeatured", value)}
            />
            <Checkbox
              checked={fields.showOnHomepage}
              label="Show on homepage"
              name="showOnHomepage"
              onChange={(value) => update("showOnHomepage", value)}
            />
          </div>
        </FormSection>
      </Card>

      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <Link
          className={buttonClasses("ghost")}
          href={event ? `/dashboard/events/${event.id}` : "/dashboard/events"}
        >
          Cancel
        </Link>
        <button className={buttonClasses("primary")} disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving…" : isEditing ? "Save changes" : "Create draft event"}
        </button>
      </div>
    </form>
  );
}

function FormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="space-y-6">
      <div className="border-b border-line pb-5">
        <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  children,
  error,
  hint,
  label,
  name,
  required = false,
}: {
  children: React.ReactNode;
  error?: string;
  hint?: string;
  label: string;
  name: keyof FormFields;
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

function Checkbox({
  checked,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  label: string;
  name: keyof FormFields;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 border border-line bg-surface px-4 py-3 text-sm text-ink transition hover:border-gold">
      <input
        checked={checked}
        className="size-4 accent-[var(--td-color-gold)]"
        name={name}
        onChange={(e) => onChange(e.target.checked)}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}

function initialFields(event?: AdminEventDetails): FormFields {
  return {
    slug: event?.slug ?? "",
    title: event?.title ?? "",
    shortDescription: event?.shortDescription ?? "",
    longDescription: event?.longDescription ?? "",
    eventType: event?.eventType ?? "",
    startAtUtc: toLocalInput(event?.startAtUtc),
    endAtUtc: toLocalInput(event?.endAtUtc),
    timeZoneId: event?.timeZoneId ?? "Asia/Amman",
    city: event?.city ?? "Amman",
    venueName: event?.venueName ?? "",
    venueAddress: event?.venueAddress ?? "",
    mapUrl: event?.mapUrl ?? "",
    externalBookingUrl: event?.externalBookingUrl ?? "",
    isBookingEnabled: event?.isBookingEnabled ?? false,
    bookingOpensAtUtc: toLocalInput(event?.bookingOpensAtUtc),
    bookingClosesAtUtc: toLocalInput(event?.bookingClosesAtUtc),
    isFeatured: event?.isFeatured ?? false,
    showOnHomepage: event?.showOnHomepage ?? false,
  };
}

function validate(fields: FormFields): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.title.trim()) errors.title = "Title is required.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.slug))
    errors.slug = "Use lowercase letters, numbers, and single hyphens.";
  if (!fields.eventType.trim()) errors.eventType = "Event type is required.";
  if (!fields.startAtUtc) errors.startAtUtc = "Start date and time are required.";
  if (!fields.endAtUtc) errors.endAtUtc = "End date and time are required.";
  if (
    fields.startAtUtc &&
    fields.endAtUtc &&
    new Date(fields.endAtUtc) <= new Date(fields.startAtUtc)
  )
    errors.endAtUtc = "End must be after start.";
  if (!fields.timeZoneId.trim()) errors.timeZoneId = "Time zone is required.";
  if (!fields.city.trim()) errors.city = "City is required.";
  if (!fields.venueName.trim()) errors.venueName = "Venue name is required.";
  if (!validOptionalUrl(fields.mapUrl)) errors.mapUrl = "Enter an absolute HTTP or HTTPS URL.";
  if (!validOptionalUrl(fields.externalBookingUrl))
    errors.externalBookingUrl = "Enter an absolute HTTP or HTTPS URL.";
  if (
    fields.bookingOpensAtUtc &&
    fields.bookingClosesAtUtc &&
    new Date(fields.bookingClosesAtUtc) < new Date(fields.bookingOpensAtUtc)
  )
    errors.bookingClosesAtUtc = "Booking close cannot be before booking open.";
  return errors;
}

function validOptionalUrl(value: string | null): boolean {
  if (!value?.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function toRequest(fields: FormFields): SaveEventRequest {
  return {
    ...fields,
    slug: fields.slug.trim(),
    title: fields.title.trim(),
    shortDescription: fields.shortDescription.trim(),
    longDescription: fields.longDescription.trim(),
    eventType: fields.eventType.trim(),
    startAtUtc: new Date(fields.startAtUtc).toISOString(),
    endAtUtc: new Date(fields.endAtUtc).toISOString(),
    timeZoneId: fields.timeZoneId.trim(),
    city: fields.city.trim(),
    venueName: fields.venueName.trim(),
    venueAddress: optional(fields.venueAddress),
    mapUrl: optional(fields.mapUrl),
    externalBookingUrl: optional(fields.externalBookingUrl),
    bookingOpensAtUtc: optionalDate(fields.bookingOpensAtUtc),
    bookingClosesAtUtc: optionalDate(fields.bookingClosesAtUtc),
  };
}

function optional(value: string | null): string | null {
  return value?.trim() || null;
}
function optionalDate(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
function toLocalInput(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
