import type { PublicEventListItem } from "@the-domain/types";
import { Container, EmptyState, Section, buttonClasses } from "@the-domain/ui";
import Link from "next/link";
import { HomepageEventPreview } from "./homepage-event-preview";
import { HomeSectionHeader } from "./home-section-header";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";

export function HomepageEventsSection({
  events,
  unavailable,
  title,
}: {
  events: PublicEventListItem[];
  unavailable: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <Section>
      <Container>
        <HomeSectionHeader
          eyebrow="Featured & Upcoming"
          title={title ?? "The next frame is taking shape."}
        />
        {events.length > 0 ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {events.map((event, index) => (
              <HomepageEventPreview event={event} key={event.id} priority={index === 0} />
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
        {events.length > 0 && (
          <div className="mt-10 text-center">
            <Link className={buttonClasses("secondary")} href="/events">
              <DynamicText kind="action">View All Events</DynamicText>
            </Link>
          </div>
        )}
      </Container>
    </Section>
  );
}
