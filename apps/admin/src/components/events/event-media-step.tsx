import type { AdminEventDetails, AdminEventMediaItem } from "@the-domain/types";
import { InlineAlert } from "@the-domain/ui";
import { EventMediaWorkspace } from "@/components/event-media/event-media-workspace";

export function EventMediaStep({
  event,
  initialItems,
  notice,
  onItemsChange,
}: {
  event: AdminEventDetails;
  initialItems?: AdminEventMediaItem[];
  notice?: string;
  onItemsChange: (items: AdminEventMediaItem[]) => void;
}) {
  return (
    <section className="space-y-8" aria-labelledby="event-media-step-title">
      <header className="border-b border-line pb-5">
        <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Step 3</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink" id="event-media-step-title">
          Media
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
          Upload or select reusable library assets, choose an approved image cover, and set the
          accessible public order.
        </p>
      </header>
      {notice && <InlineAlert tone="success">{notice}</InlineAlert>}
      <EventMediaWorkspace
        embedded
        eventDetails={event}
        initialItems={initialItems}
        eventId={event.id}
        onItemsChange={onItemsChange}
      />
    </section>
  );
}
