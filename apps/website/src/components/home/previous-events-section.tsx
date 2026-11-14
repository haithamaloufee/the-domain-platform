import type { PublicEventListItem } from "@the-domain/types";
import { Container, EmptyState, Section, buttonClasses } from "@the-domain/ui";
import Link from "next/link";
import { HomepageEventPreview } from "./homepage-event-preview";
import { HomeSectionHeader } from "./home-section-header";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";

export function PreviousEventsSection({
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
    <Section className="border-y border-line bg-surface/25">
      <Container>
        <HomeSectionHeader
          eyebrow="Previous Events"
          title={title ?? "The night ends. The story remains."}
        />
        {events.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5">
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
          <div className="mt-10 text-center" data-reveal="copy">
            <Link
              className={buttonClasses(
                "secondary",
                "homepage-section-cta homepage-section-cta--prominent",
              )}
              href="/events"
            >
              <DynamicText kind="action">Explore The Archive</DynamicText>
            </Link>
          </div>
        )}
      </Container>
    </Section>
  );
}
