import { EventDisplayStatus, type PublicEventListItem } from "@the-domain/types";
import { Container, EmptyState, Section } from "@the-domain/ui";
import type { Metadata } from "next";
import { PublicEventCard } from "@/components/events/public-event-card";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";
import { getFeaturedEvents, getPreviousEvents, getUpcomingEvents } from "@/lib/public-api";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Events in Jordan",
  description: "Discover upcoming Domain experiences and revisit previous events in Jordan.",
  path: "/events",
});

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

  const { featured, previous, upcoming } = data;
  const featuredIds = new Set(featured.map((event) => event.id));
  const happeningNow = upcoming.filter(
    (event) => event.displayStatus === EventDisplayStatus.Live && !featuredIds.has(event.id),
  );
  const nextEvents = upcoming.filter(
    (event) => event.displayStatus === EventDisplayStatus.Upcoming && !featuredIds.has(event.id),
  );
  const hasCurrentProgramme = featured.length + happeningNow.length + nextEvents.length > 0;

  return (
    <>
      <Section className="architectural-grid border-b border-line py-20 sm:py-28 lg:py-32">
        <Container>
          <header className="max-w-5xl">
            <p className="type-eyebrow text-gold">
              <DynamicText kind="label">Programme</DynamicText>
            </p>
            <h1 className="type-page-heading mt-5 text-ink">
              <DynamicText kind="heading">Events</DynamicText>
            </h1>
            <p className="type-body-lead mt-7 text-ink-muted">
              <DynamicText>
                Discover what is next, then step back into the nights that shaped The Domain.
              </DynamicText>
            </p>
          </header>
        </Container>
      </Section>

      {featured.length > 0 && (
        <ProgrammeSection
          description="Selected experiences from the current programme, presented through their approved CMS artwork and event details."
          eyebrow="In focus"
          title="Featured events"
        >
          <div className="grid gap-x-5 gap-y-14 lg:grid-cols-12">
            {featured.map((event, index) => (
              <PublicEventCard
                className={featuredCardClass(featured.length, index)}
                event={event}
                key={event.id}
                priority={index < 2}
                variant="featured"
              />
            ))}
          </div>
        </ProgrammeSection>
      )}

      {happeningNow.length > 0 && (
        <ProgrammeSection
          className="border-t border-line"
          description="Events currently inside their published start and end window."
          eyebrow="On now"
          title="Happening now"
        >
          <div className="grid gap-x-5 gap-y-14 md:grid-cols-2">
            {happeningNow.map((event) => (
              <PublicEventCard event={event} key={event.id} variant="featured" />
            ))}
          </div>
        </ProgrammeSection>
      )}

      {nextEvents.length > 0 && (
        <ProgrammeSection
          className="border-t border-line"
          description="Future experiences, with verified external booking shown only when the CMS makes it available."
          eyebrow="Next in Amman"
          title="Upcoming events"
        >
          <div className="grid gap-x-5 gap-y-14 md:grid-cols-2">
            {nextEvents.map((event, index) => (
              <PublicEventCard event={event} key={event.id} priority={index < 2} />
            ))}
          </div>
        </ProgrammeSection>
      )}

      {!hasCurrentProgramme && (
        <Section>
          <Container>
            <EmptyState
              description="Follow The Domain for the next announcement."
              title="No upcoming events at the moment"
            />
          </Container>
        </Section>
      )}

      {previous.length > 0 ? (
        <ProgrammeSection
          className="border-t border-line bg-surface/20"
          description="Finished events remain part of the archive through their approved highlights."
          eyebrow="The archive"
          title="Previous events"
        >
          <div className="grid gap-x-5 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {previous.map((event) => (
              <PublicEventCard event={event} key={event.id} variant="archive" />
            ))}
          </div>
        </ProgrammeSection>
      ) : (
        <Section className="border-t border-line">
          <Container>
            <EmptyState
              description="Previous event highlights will appear here once published."
              title="The archive is being prepared"
            />
          </Container>
        </Section>
      )}
    </>
  );
}

function ProgrammeSection({
  children,
  className,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <Section className={className}>
      <Container>
        <CinematicReveal>
          <header className="mb-10 grid gap-5 sm:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)] lg:items-end">
            <div>
              <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                <DynamicText kind="label">{eyebrow}</DynamicText>
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] text-ink sm:text-6xl">
                <DynamicText kind="heading">{title}</DynamicText>
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-ink-muted sm:text-base lg:justify-self-end">
              <DynamicText>{description}</DynamicText>
            </p>
          </header>
          {children}
        </CinematicReveal>
      </Container>
    </Section>
  );
}

function featuredCardClass(count: number, index: number): string {
  if (count === 1) return "lg:col-span-9";
  return index % 4 === 0 || index % 4 === 3 ? "lg:col-span-7" : "lg:col-span-5";
}

async function loadEvents() {
  try {
    const [featured, previous, upcoming] = await Promise.all([
      getFeaturedEvents(),
      getPreviousEvents(),
      getUpcomingEvents(),
    ]);
    return { featured, previous, upcoming } satisfies {
      featured: PublicEventListItem[];
      previous: PublicEventListItem[];
      upcoming: PublicEventListItem[];
    };
  } catch {
    return null;
  }
}
