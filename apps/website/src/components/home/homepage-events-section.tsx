import type { PublicEventListItem } from "@the-domain/types";
import { Container, EmptyState, Section } from "@the-domain/ui";
import { PublicEventCard } from "@/components/events/public-event-card";
import { HomeSectionHeader } from "./home-section-header";

export function HomepageEventsSection({
  events,
  unavailable,
}: {
  events: PublicEventListItem[];
  unavailable: boolean;
}) {
  return (
    <Section>
      <Container>
        <HomeSectionHeader
          actionHref="/events"
          actionLabel="View All Events"
          description="Featured experiences lead the programme, followed by what is coming next. Booking remains on the event's verified external platform."
          eyebrow="Featured & Upcoming"
          title="The next frame is taking shape."
        />
        {events.length > 0 ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {events.map((event, index) => (
              <PublicEventCard
                event={event}
                key={event.id}
                priority={index === 0}
                variant="compact"
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              description={
                unavailable
                  ? "The public event programme could not be reached. Please try again shortly."
                  : "New public events will appear here once they are announced."
              }
              title={unavailable ? "Events are temporarily off screen" : "No upcoming events yet"}
            />
          </div>
        )}
      </Container>
    </Section>
  );
}
