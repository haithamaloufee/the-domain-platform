import { FormField, Input, Select, Textarea } from "@the-domain/ui";
import {
  commonEventTypes,
  knownCities,
  isManualSlugOverride,
  otherEventType,
  type EventWizardErrors,
  type EventWizardFields,
  type EventWizardUpdate,
} from "@/lib/events/event-wizard-model";

export function EventBasicStep({
  errors,
  fields,
  isExisting,
  canonicalSlug,
  onChange,
  knownVenues,
}: {
  errors: EventWizardErrors;
  fields: EventWizardFields;
  isExisting: boolean;
  canonicalSlug?: string;
  knownVenues: readonly string[];
  onChange: EventWizardUpdate;
}) {
  return (
    <fieldset className="space-y-8">
      <legend className="sr-only">Basic event information</legend>
      <header className="border-b border-line pb-5">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Step 1</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">Basic information</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
          Enter the public-facing story and location. Technical identifiers stay out of the way.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          error={errors.title}
          helperText="Keep the intended display casing and punctuation."
          id="title"
          label="Event title"
          required
        >
          {(control) => (
            <Input {...control} autoComplete="off" maxLength={200} onChange={(event) => onChange("title", event.target.value)} value={fields.title} />
          )}
        </FormField>
        <FormField error={errors.eventTypeChoice} id="eventTypeChoice" label="Event type" required>
          {(control) => (
            <Select {...control} onChange={(event) => onChange("eventTypeChoice", event.target.value)} placeholder="Choose an event type" value={fields.eventTypeChoice}>
              {commonEventTypes.map((value) => <option key={value} value={value}>{value}</option>)}
              <option value={otherEventType}>{otherEventType}</option>
            </Select>
          )}
        </FormField>
      </div>

      {fields.eventTypeChoice === otherEventType && (
        <FormField error={errors.customEventType} id="customEventType" label="Custom event type" required>
          {(control) => (
            <Input {...control} maxLength={100} onChange={(event) => onChange("customEventType", event.target.value)} value={fields.customEventType} />
          )}
        </FormField>
      )}

      <FormField error={errors.shortDescription} helperText="Used on public event cards." id="shortDescription" label="Short description" required>
        {(control) => (
          <Textarea {...control} className="min-h-28" maxLength={500} onChange={(event) => onChange("shortDescription", event.target.value)} value={fields.shortDescription} />
        )}
      </FormField>
      <FormField error={errors.longDescription} helperText="The complete editorial description for the event detail page." id="longDescription" label="Full description" required>
        {(control) => (
          <Textarea {...control} className="min-h-52" maxLength={10_000} onChange={(event) => onChange("longDescription", event.target.value)} value={fields.longDescription} />
        )}
      </FormField>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField error={errors.city} id="city" label="City" required>
          {(control) => (
            <><Input {...control} list="event-city-suggestions" maxLength={100} onChange={(event) => onChange("city", event.target.value)} value={fields.city} /><datalist id="event-city-suggestions">{knownCities.map((city) => <option key={city} value={city} />)}</datalist></>
          )}
        </FormField>
        <FormField error={errors.venueName} id="venueName" label="Venue name" required>
          {(control) => (
            <><Input {...control} list="event-venue-suggestions" maxLength={200} onChange={(event) => onChange("venueName", event.target.value)} value={fields.venueName} /><datalist id="event-venue-suggestions">{knownVenues.map((venue) => <option key={venue} value={venue} />)}</datalist></>
          )}
        </FormField>
        <FormField id="venueAddress" label="Venue address" helperText="Optional">
          {(control) => <Input {...control} maxLength={500} onChange={(event) => onChange("venueAddress", event.target.value)} value={fields.venueAddress} />}
        </FormField>
        <FormField id="mapUrl" label="Map URL" helperText="Optional HTTP or HTTPS map link.">
          {(control) => <Input {...control} onChange={(event) => onChange("mapUrl", event.target.value)} placeholder="https://…" type="url" value={fields.mapUrl} />}
        </FormField>
      </div>

      <details className="border border-line bg-surface-raised p-5">
        <summary className="cursor-pointer font-label text-xs font-semibold uppercase tracking-[0.12em] text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
          Advanced settings
        </summary>
        <div className="mt-5">
          <FormField
            error={errors.slug}
            helperText={isExisting ? "Leave unchanged to preserve the public URL." : "Optional. Leave blank to generate the canonical URL from the title."}
            id="slug"
            label="Public URL slug"
          >
            {(control) => <Input {...control} maxLength={160} onChange={(event) => onChange("slug", event.target.value)} value={fields.slug} />}
          </FormField>
          {isExisting && isManualSlugOverride(fields.slug, canonicalSlug) && (
            <p className="mt-3 border-l-2 border-warning bg-warning/10 px-4 py-3 text-sm text-ink">
              Changing this value changes the event’s public URL. Title edits never change it automatically.
            </p>
          )}
        </div>
      </details>
    </fieldset>
  );
}
