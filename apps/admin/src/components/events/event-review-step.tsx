import { EventPublicationStatus, type AdminEventMediaItem } from "@the-domain/types";
import { InlineAlert, LoadingButton } from "@the-domain/ui";
import { EventPreview } from "./event-preview";
import {
  buildPublishChecklist,
  canPublish,
  type EventWizardFields,
} from "@/lib/events/event-wizard-model";

export function EventReviewStep({
  coverWarningAcknowledged,
  fields,
  media,
  onAcknowledgeCoverWarning,
  onPublish,
  onSave,
  pending,
  publicUrl,
  savedSlug,
}: {
  coverWarningAcknowledged: boolean;
  fields: EventWizardFields;
  media: AdminEventMediaItem[];
  onAcknowledgeCoverWarning: (value: boolean) => void;
  onPublish: () => void;
  onSave: () => void;
  pending: boolean;
  publicUrl?: string;
  savedSlug: string;
}) {
  const checklist = buildPublishChecklist(fields, media, coverWarningAcknowledged, pending);
  const publishReady = canPublish(checklist);
  const hasCoverWarning = checklist.some((item) => item.id === "cover" && item.warning);
  const actionLabel = fields.publicationStatus === EventPublicationStatus.Published ? "Save and publish" : fields.publicationStatus === EventPublicationStatus.Cancelled ? "Save and cancel event" : fields.publicationStatus === EventPublicationStatus.Archived ? "Save and archive" : "Save draft";

  return (
    <section className="space-y-10" aria-labelledby="event-review-step-title">
      <header className="border-b border-line pb-5">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Step 4</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink" id="event-review-step-title">Review and publish</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">Review the current saved media and local event values. Nothing publishes until you confirm below.</p>
      </header>

      <section aria-labelledby="publish-checklist-title" className="border border-line bg-surface-raised p-5 sm:p-7">
        <h3 className="font-display text-2xl font-bold text-ink" id="publish-checklist-title">Publication checklist</h3>
        <ul className="mt-5 space-y-3">
          {checklist.map((item) => <li className="flex gap-3 text-sm leading-6" key={item.id}><span aria-hidden="true" className={item.met ? "text-success" : item.warning ? "text-warning" : "text-error"}>{item.met ? "✓" : "—"}</span><span className="text-ink">{item.label}</span></li>)}
        </ul>
        {hasCoverWarning && (
          <label className="mt-6 flex min-h-12 items-start gap-3 border border-warning bg-warning/10 p-4 text-sm leading-6 text-ink">
            <input checked={coverWarningAcknowledged} className="mt-1 size-4 accent-[var(--td-color-gold)]" onChange={(event) => onAcknowledgeCoverWarning(event.target.checked)} type="checkbox" />
            <span>I understand that public pages will use the intentional artwork fallback until an eligible cover is selected.</span>
          </label>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <LoadingButton disabled={!publishReady} onClick={onPublish} pending={pending} pendingLabel="Saving event…">{actionLabel}</LoadingButton>
          <LoadingButton onClick={onSave} pending={pending} pendingLabel="Saving changes…" variant="secondary">Save without lifecycle change</LoadingButton>
        </div>
        {savedSlug && <InlineAlert className="mt-5" tone="info">Canonical public path: <span className="font-semibold">/events/{savedSlug}</span></InlineAlert>}
        {publicUrl && (
          <a
            className="mt-4 inline-flex min-h-11 items-center font-label text-xs font-semibold uppercase tracking-[0.12em] text-gold underline decoration-gold/50 underline-offset-4 hover:decoration-gold"
            href={publicUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open public event page
          </a>
        )}
      </section>

      <EventPreview fields={fields} media={media} />
    </section>
  );
}
