import { Container, Section } from "@the-domain/ui";
import { BrandedLoader } from "@/components/layout/branded-loader";

export default function GalleryLoading() {
  return (
    <>
      <BrandedLoader compact />
      <Section className="pt-0">
        <Container>
          <div className="grid gap-5 lg:grid-cols-2" role="status">
            <div className="h-[32rem] animate-pulse border border-line bg-surface-raised" />
            <div className="h-[32rem] animate-pulse border border-line bg-surface-raised" />
            <span className="sr-only">Loading gallery albums</span>
          </div>
        </Container>
      </Section>
    </>
  );
}
