import type { PublicEventListItem } from "@the-domain/types";
import { Container, EmptyState, Section } from "@the-domain/ui";
import { PublicEventCard } from "@/components/events/public-event-card";
import { HomeSectionHeader } from "./home-section-header";

export function PreviousEventsSection({
  events,
  unavailable,
}: {
  events: PublicEventListItem[];
  unavailable: boolean;
}) {
  return (
    <Section className="border-y border-line bg-surface/25">
      <Container>
        <HomeSectionHeader
          actionHref="/events"
          actionLabel="Explore The Archive"
          description="Finished events return as approved highlights—an evolving record of the rooms, stages, and audiences that shaped each experience."
          eyebrow="Previous Events"
          title="The night ends. The story remains."
        />
        {events.length > 0 ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {events.map((event) => (
              <PublicEventCard event={event} key={event.id} variant="compact" />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              description={
                unavailable
                  ? "The previous-event archive could not be reached. Please try again shortly."
                  : "Published highlights will appear after events are completed."
              }
              title={
                unavailable
                  ? "The archive is temporarily unavailable"
                  : "The archive is being prepared"
              }
            />
          </div>
        )}
      </Container>
    </Section>
  );
}
