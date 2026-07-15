import {
  BookingAvailability,
  type EventPublicationStatusValue,
} from "@the-domain/types";
import { FormField, Input, Select } from "@the-domain/ui";
import {
  bookingPreview,
  canTransitionPublication,
  manualBookingOptions,
  publicationOptions,
} from "@/lib/events/event-lifecycle";
import {
  timezoneOptions,
  type EventWizardErrors,
  type EventWizardFields,
  type EventWizardUpdate,
} from "@/lib/events/event-wizard-model";

export function EventScheduleStep({
  canonicalStatus,
  errors,
  fields,
  onChange,
}: {
  canonicalStatus: EventPublicationStatusValue;
  errors: EventWizardErrors;
  fields: EventWizardFields;
  onChange: EventWizardUpdate;
}) {
  const timezones = timezoneOptions(fields.timeZoneId);
  const booking = bookingPreview({
    bookingClosesAt: join(fields.bookingCloseDate, fields.bookingCloseTime),
    bookingOpensAt: join(fields.bookingOpenDate, fields.bookingOpenTime),
    bookingStatus: fields.bookingStatus,
    endAt: join(fields.endDate, fields.endTime),
    externalBookingUrl: fields.externalBookingUrl,
    publicationStatus: fields.publicationStatus,
    timeZoneId: fields.timeZoneId,
  });

  return (
    <fieldset className="space-y-8">
      <legend className="sr-only">Schedule, lifecycle, and booking</legend>
      <header className="border-b border-line pb-5">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Step 2</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">Schedule and booking</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
          Enter the local date and time visitors expect. The platform stores the correct UTC instant.
        </p>
      </header>

      <section aria-labelledby="event-schedule-heading" className="space-y-6">
        <h3 className="font-display text-xl font-bold text-ink" id="event-schedule-heading">Event schedule</h3>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <FormField error={errors.startDate} id="startDate" label="Start date" required>
            {(control) => <Input {...control} onChange={(event) => onChange("startDate", event.target.value)} type="date" value={fields.startDate} />}
          </FormField>
          <FormField error={errors.startTime} id="startTime" label="Start time" required>
            {(control) => <Input {...control} onChange={(event) => onChange("startTime", event.target.value)} type="time" value={fields.startTime} />}
          </FormField>
          <FormField error={errors.endDate} id="endDate" label="End date" required>
            {(control) => <Input {...control} onChange={(event) => onChange("endDate", event.target.value)} type="date" value={fields.endDate} />}
          </FormField>
          <FormField error={errors.endTime} id="endTime" label="End time" required>
            {(control) => <Input {...control} onChange={(event) => onChange("endTime", event.target.value)} type="time" value={fields.endTime} />}
          </FormField>
        </div>
        <FormField
          error={errors.timeZoneId}
          helperText="Search or type a supported IANA timezone. Asia/Amman is the default."
          id="timeZoneId"
          label="Event timezone"
          required
        >
          {(control) => (
            <>
              <Input {...control} list="event-timezone-options" onChange={(event) => onChange("timeZoneId", event.target.value)} value={fields.timeZoneId} />
              <datalist id="event-timezone-options">{timezones.map((timezone) => <option key={timezone} value={timezone} />)}</datalist>
            </>
          )}
        </FormField>
        <p className="border-l-2 border-gold bg-gold/5 px-4 py-3 text-sm leading-6 text-ink-muted">
          <span className="font-semibold text-ink">Readable schedule: </span>
          {scheduleSummary(fields)}
        </p>
      </section>

      <section aria-labelledby="event-lifecycle-heading" className="space-y-5 border-t border-line pt-8">
        <h3 className="font-display text-xl font-bold text-ink" id="event-lifecycle-heading">Lifecycle</h3>
        <FormField helperText={publicationOptions.find((option) => option.value === fields.publicationStatus)?.description} id="publicationStatus" label="Event state" required>
          {(control) => (
            <Select {...control} onChange={(event) => onChange("publicationStatus", Number(event.target.value) as EventPublicationStatusValue)} value={fields.publicationStatus}>
              {publicationOptions.map((option) => (
                <option disabled={!canTransitionPublication(canonicalStatus, option.value)} key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          )}
        </FormField>
        <p className="text-xs leading-5 text-ink-muted">
          Reaching Review never publishes automatically. The selected transition is applied only after explicit confirmation.
        </p>
      </section>

      <section aria-labelledby="event-booking-heading" className="space-y-6 border-t border-line pt-8">
        <h3 className="font-display text-xl font-bold text-ink" id="event-booking-heading">External booking</h3>
        <FormField id="bookingStatus" label="Booking state" required>
          {(control) => (
            <Select {...control} onChange={(event) => onChange("bookingStatus", Number(event.target.value) as EventWizardFields["bookingStatus"])} value={fields.bookingStatus}>
              {manualBookingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          )}
        </FormField>

        {fields.bookingStatus === BookingAvailability.Open && (
          <div className="grid gap-6 md:grid-cols-2">
            <FormField className="md:col-span-2" error={errors.externalBookingUrl} helperText="The Domain redirects visitors to this HTTPS ticketing page." id="externalBookingUrl" label="External booking URL" required>
              {(control) => <Input {...control} onChange={(event) => onChange("externalBookingUrl", event.target.value)} placeholder="https://…" type="url" value={fields.externalBookingUrl} />}
            </FormField>
            <DateTimePair dateError={errors.bookingOpenDate} dateField="bookingOpenDate" dateLabel="Booking opens date" fields={fields} onChange={onChange} timeError={errors.bookingOpenTime} timeField="bookingOpenTime" timeLabel="Booking opens time" />
            <DateTimePair dateError={errors.bookingCloseDate} dateField="bookingCloseDate" dateLabel="Booking closes date" fields={fields} onChange={onChange} timeError={errors.bookingCloseTime} timeField="bookingCloseTime" timeLabel="Booking closes time" />
          </div>
        )}
        <p className="border-l-2 border-gold/70 bg-gold/5 px-4 py-3 text-sm leading-6 text-ink-muted" role="status">
          <span className="font-semibold text-ink">Effective public result: </span>{booking}
        </p>
      </section>

      <section aria-labelledby="event-placement-heading" className="space-y-4 border-t border-line pt-8">
        <h3 className="font-display text-xl font-bold text-ink" id="event-placement-heading">Promotion</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Checkbox checked={fields.isFeatured} label="Feature this event" onChange={(value) => onChange("isFeatured", value)} />
          <Checkbox checked={fields.showOnHomepage} label="Show on homepage" onChange={(value) => onChange("showOnHomepage", value)} />
        </div>
      </section>
    </fieldset>
  );
}

function DateTimePair({ dateError, dateField, dateLabel, fields, onChange, timeError, timeField, timeLabel }: {
  dateError?: string;
  dateField: "bookingOpenDate" | "bookingCloseDate";
  dateLabel: string;
  fields: EventWizardFields;
  onChange: EventWizardUpdate;
  timeError?: string;
  timeField: "bookingOpenTime" | "bookingCloseTime";
  timeLabel: string;
}) {
  return <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
    <FormField error={dateError} helperText="Optional" id={dateField} label={dateLabel}>{(control) => <Input {...control} onChange={(event) => onChange(dateField, event.target.value)} type="date" value={fields[dateField]} />}</FormField>
    <FormField error={timeError} helperText="Optional" id={timeField} label={timeLabel}>{(control) => <Input {...control} onChange={(event) => onChange(timeField, event.target.value)} type="time" value={fields[timeField]} />}</FormField>
  </div>;
}

function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return <label className="flex min-h-12 cursor-pointer items-center gap-3 border border-line bg-surface px-4 py-3 text-sm text-ink transition hover:border-gold focus-within:border-gold">
    <input checked={checked} className="size-4 accent-[var(--td-color-gold)]" onChange={(event) => onChange(event.target.checked)} type="checkbox" />
    <span>{label}</span>
  </label>;
}

function join(date: string, time: string) { return date && time ? `${date}T${time}` : ""; }

function scheduleSummary(fields: EventWizardFields): string {
  if (!fields.startDate || !fields.startTime) return "Choose the event start and timezone.";
  try {
    const value = new Date(`${fields.startDate}T${fields.startTime}:00`);
    return `${new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" }).format(value)} — ${fields.timeZoneId}`;
  } catch {
    return `${fields.startDate} ${fields.startTime} — ${fields.timeZoneId}`;
  }
}
