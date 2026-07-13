import { Container, EventCardSkeleton, Section } from "@the-domain/ui";
import { BrandedLoader } from "@/components/layout/branded-loader";

export default function EventsLoading() {
  return (
    <>
      <BrandedLoader compact />
      <Section className="pt-0">
        <Container>
          <div className="space-y-8" role="status">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <span className="sr-only">Loading public events</span>
          </div>
        </Container>
      </Section>
    </>
  );
}
