import { Container, Section } from "@the-domain/ui";

export default function GalleryLoading() {
  return (
    <Section>
      <Container>
        <div className="mb-12 h-28 max-w-3xl animate-pulse bg-surface-raised" />
        <div className="grid gap-5 lg:grid-cols-2" role="status">
          <div className="h-[32rem] animate-pulse border border-line bg-surface-raised" />
          <div className="h-[32rem] animate-pulse border border-line bg-surface-raised" />
          <span className="sr-only">Loading gallery albums</span>
        </div>
      </Container>
    </Section>
  );
}
