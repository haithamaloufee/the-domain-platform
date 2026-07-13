import type { Metadata } from "next";
import { Container, EmptyState, Section, SectionHeader } from "@the-domain/ui";
import { PublicEventCard } from "@/components/events/public-event-card";
import { getPreviousEvents, getUpcomingEvents } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover upcoming Domain experiences and revisit previous events in Jordan.",
};

export const revalidate = 60;

export default async function EventsPage() {
  const data = await loadEvents();
  if (!data) {
    return (
      <Section>
        <Container>
          <EmptyState
            description="The event programme could not be reached. Please try again shortly."
            title="Events are temporarily off screen"
          />
        </Container>
      </Section>
    );
  }

  const { previous, upcoming } = data;
  return (
    <>
      <Section className="architectural-grid border-b border-line pb-12 sm:pb-16">
        <Container>
          <SectionHeader
            description="Discover what is next, then step back into the nights that shaped The Domain."
            eyebrow="Programme"
            title="Events"
          />
        </Container>
      </Section>

      <Section className="cinematic-reveal">
        <Container>
          <SectionHeader
            description="Live and upcoming experiences with external booking when availability is open."
            eyebrow="Next in Amman"
            title="Upcoming events"
          />
          {upcoming.length > 0 ? (
            <div className="mt-10 space-y-8">
              {upcoming.map((event, index) => (
                <PublicEventCard event={event} key={event.id} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                description="Follow The Domain for the next announcement."
                title="No upcoming events at the moment"
              />
            </div>
          )}
        </Container>
      </Section>

      <Section className="cinematic-reveal border-t border-line">
        <Container>
          <SectionHeader
            description="Finished events remain part of the archive through their approved highlights."
            eyebrow="The archive"
            title="Previous events"
          />
          {previous.length > 0 ? (
            <div className="mt-10 space-y-8">
              {previous.map((event) => (
                <PublicEventCard event={event} key={event.id} />
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                description="Previous event highlights will appear here once published."
                title="The archive is being prepared"
              />
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

async function loadEvents() {
  try {
    const [upcoming, previous] = await Promise.all([getUpcomingEvents(), getPreviousEvents()]);
    return { previous, upcoming };
  } catch {
    return null;
  }
}
