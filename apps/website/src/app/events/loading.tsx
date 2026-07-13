import { Container, EventCardSkeleton, Section } from "@the-domain/ui";

export default function EventsLoading() {
  return (
    <Section>
      <Container>
        <div className="mb-12 h-28 max-w-3xl animate-pulse bg-surface-raised" />
        <div className="space-y-8" role="status">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <span className="sr-only">Loading public events</span>
        </div>
      </Container>
    </Section>
  );
}
