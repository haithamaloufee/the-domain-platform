import type { Metadata } from "next";
import { Container, Section, buttonClasses } from "@the-domain/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionMediaGrid } from "@/components/gallery/collection-media-grid";
import { getGalleryCollection, PublicApiError } from "@/lib/public-api";
import { createPageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ eventSlug: string }>;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventSlug: id } = await params;
  try {
    const collection = await getGalleryCollection(id);
    return createPageMetadata({
      title: `${collection.title} Gallery`,
      description: collection.description ?? `Curated highlights from ${collection.title}.`,
      path: `/gallery/${encodeURIComponent(id)}`,
    });
  } catch {
    return createPageMetadata({
      title: "Gallery",
      description: "Curated highlights from The Domain.",
      path: `/gallery/${encodeURIComponent(id)}`,
      noIndex: true,
    });
  }
}
export default async function GalleryCollectionPage({ params }: Props) {
  const { eventSlug: id } = await params;
  let collection;
  try {
    collection = await getGalleryCollection(id);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) notFound();
    throw error;
  }
  return (
    <article>
      <Section className="architectural-grid border-b border-line pb-12 sm:pb-16">
        <Container>
          <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">
            Curated collection
          </p>
          <h1 className="mt-4 max-w-5xl break-words font-display text-5xl font-extrabold leading-[0.9] tracking-[-0.05em] text-ink sm:text-7xl lg:text-8xl">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-6 max-w-3xl text-base leading-7 text-ink-muted">
              {collection.description}
            </p>
          )}
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-ink-muted">
            {collection.media.length} highlights
          </p>
          <div className="mt-8">
            <Link className={buttonClasses("secondary")} href="/gallery">
              Back to Gallery
            </Link>
          </div>
        </Container>
      </Section>
      <Section className="cinematic-reveal">
        <Container>
          <CollectionMediaGrid collection={collection} />
        </Container>
      </Section>
    </article>
  );
}
