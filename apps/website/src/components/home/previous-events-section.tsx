import type { PublicEventListItem } from "@the-domain/types";
import { Container, EmptyState, Section, buttonClasses } from "@the-domain/ui";
import Link from "next/link";
import { HomepageEventPreview } from "./homepage-event-preview";
import { HomeSectionHeader } from "./home-section-header";

export function PreviousEventsSection({
  events,
  unavailable,
  title,
  description,
}: {
  events: PublicEventListItem[];
  unavailable: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <Section className="border-y border-line bg-surface/25">
      <Container>
        <HomeSectionHeader
          actionHref="/events"
          actionLabel="Explore The Archive"
          description={
            description ??
            "Finished events return as approved highlights—an evolving record of the rooms, stages, and audiences that shaped each experience."
          }
          eyebrow="Previous Events"
          title={title ?? "The night ends. The story remains."}
        />
        {events.length > 0 ? (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {events.map((event) => (
              <HomepageEventPreview event={event} key={event.id} />
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
        {events.length > 0 && (
          <div className="mt-10 text-center">
            <Link className={buttonClasses("secondary")} href="/events">
              Explore The Archive
            </Link>
          </div>
        )}
      </Container>
    </Section>
  );
}
