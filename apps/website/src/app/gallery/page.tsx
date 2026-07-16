import type { Metadata } from "next";
import { Container, EmptyState, Section, SectionHeader } from "@the-domain/ui";
import { CollectionCard } from "@/components/gallery/collection-card";
import { getGalleryCollections } from "@/lib/public-api";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Gallery",
  description: "Explore curated photography and film from The Domain.",
  path: "/gallery",
});
export const revalidate = 60;
export default async function GalleryPage() {
  let collections = null;
  try {
    collections = await getGalleryCollections();
  } catch {}
  return (
    <>
      <Section className="architectural-grid border-b border-line pb-12 sm:pb-16">
        <Container>
          <SectionHeader
            description="Curated photography and film from the experiences that continue to define The Domain."
            eyebrow="Visual archive"
            title="Gallery"
          />
        </Container>
      </Section>
      <Section className="cinematic-reveal">
        <Container>
          {collections === null ? (
            <EmptyState
              description="The Gallery could not be reached. Please try again shortly."
              title="The archive is temporarily off screen"
            />
          ) : collections.length === 0 ? (
            <EmptyState
              description="Curated collections will appear here after they are published."
              title="No Gallery collections yet"
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {collections.map((collection, index) => (
                <CollectionCard collection={collection} key={collection.id} priority={index < 2} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
