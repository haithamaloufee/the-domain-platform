import { Container, EmptyState, Section } from "@the-domain/ui";
import type { Metadata } from "next";
import { CollectionCard } from "@/components/gallery/collection-card";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";
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
      <Section className="architectural-grid border-b border-line py-20 sm:py-28 lg:py-32">
        <Container>
          <header className="max-w-5xl">
            <p className="type-eyebrow text-gold">
              <DynamicText kind="label">Visual archive</DynamicText>
            </p>
            <h1 className="type-page-heading mt-5 text-ink">
              <DynamicText kind="heading">Gallery</DynamicText>
            </h1>
            <p className="type-body-lead mt-7 text-ink-muted">
              <DynamicText>
                Curated photography and film from the experiences that continue to define The
                Domain.
              </DynamicText>
            </p>
          </header>
        </Container>
      </Section>

      <Section>
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
            <CinematicReveal>
              <div className="grid gap-5 lg:grid-cols-12 lg:gap-y-8">
                {collections.map((collection, index) => (
                  <CollectionCard
                    className={collectionCardClass(index)}
                    collection={collection}
                    key={collection.id}
                    priority={index < 2}
                    variant={index === 0 ? "wide" : index % 3 === 1 ? "tall" : "standard"}
                  />
                ))}
              </div>
            </CinematicReveal>
          )}
        </Container>
      </Section>
    </>
  );
}

function collectionCardClass(index: number): string {
  if (index === 0) return "lg:col-span-12";
  return index % 4 === 1 || index % 4 === 0 ? "lg:col-span-5" : "lg:col-span-7";
}
