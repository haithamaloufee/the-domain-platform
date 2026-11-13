import { MediaType } from "@the-domain/types";
import { Container, EmptyState, Section, buttonClasses } from "@the-domain/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionMediaGrid } from "@/components/gallery/collection-media-grid";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";
import { getGalleryMediaPage, PublicApiError } from "@/lib/public-api";
import { createPageMetadata, getGalleryMediaSeoImage } from "@/lib/seo";

interface Props {
  params: Promise<{ eventSlug: string }>;
  searchParams: Promise<{ offset?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventSlug: id } = await params;
  try {
    const { collection } = await getGalleryMediaPage(id, 0);
    const featured =
      collection.media.find((item) => item.id === collection.featuredMediaId) ??
      collection.media[0];
    return createPageMetadata({
      title: `${collection.title} Gallery`,
      description: collection.description ?? `Curated highlights from ${collection.title}.`,
      path: `/gallery/${encodeURIComponent(id)}`,
      image: getGalleryMediaSeoImage(featured),
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

export default async function GalleryCollectionPage({ params, searchParams }: Props) {
  const { eventSlug: id } = await params;
  const requestedOffset = Number((await searchParams).offset);
  const offset =
    Number.isSafeInteger(requestedOffset) && requestedOffset > 0 && requestedOffset <= 100_000
      ? requestedOffset
      : 0;
  let page;
  try {
    page = await getGalleryMediaPage(id, offset);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) notFound();
    throw error;
  }
  const { collection, nextOffset } = page;

  const featured =
    collection.media.find((item) => item.id === collection.featuredMediaId) ?? collection.media[0];
  const featuredSource = getGalleryMediaSeoImage(featured);

  return (
    <article>
      <Section className="architectural-grid border-b border-line py-16 sm:py-24 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(28rem,1.22fr)] lg:items-end">
            <div className="relative z-10">
              <Link
                className={buttonClasses(
                  "ghost",
                  "-ml-3 min-h-10 px-3 text-ink-muted hover:text-gold",
                )}
                href="/gallery"
              >
                <span aria-hidden="true">←</span>{" "}
                <DynamicText kind="action">Back to Gallery</DynamicText>
              </Link>
              <p className="mt-8 font-label text-xs uppercase tracking-[0.14em] text-gold">
                <DynamicText kind="label">Curated collection</DynamicText>
              </p>
              <h1 className="mt-4 max-w-[12ch] break-words font-display text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] text-ink sm:text-6xl lg:text-7xl">
                <DynamicText kind="heading">{collection.title}</DynamicText>
              </h1>
              {collection.description && (
                <p className="mt-6 max-w-xl text-base leading-7 text-ink-muted">
                  <DynamicText>{collection.description}</DynamicText>
                </p>
              )}
              <p className="mt-5 font-label text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">
                <DynamicText kind="label">
                  {`${collection.media.length} ${collection.media.length === 1 ? "highlight" : "highlights"}`}
                </DynamicText>
              </p>
            </div>

            <div
              aria-hidden="true"
              className="relative aspect-[4/3] min-h-72 overflow-hidden border border-line bg-surface-raised sm:aspect-video"
            >
              {featuredSource ? (
                <Image
                  alt=""
                  className="cinematic-media object-cover"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  src={featuredSource}
                />
              ) : (
                <div className="architectural-grid grid h-full place-items-center text-sm text-ink-muted">
                  Collection preview unavailable
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-canvas/65 via-transparent to-transparent" />
              {featured?.mediaType === MediaType.Video && (
                <span className="absolute bottom-4 left-4 border border-ink/40 bg-canvas/75 px-3 py-2 font-label text-[0.625rem] uppercase tracking-[0.12em] text-ink backdrop-blur-sm">
                  Lead video
                </span>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <CinematicReveal>
            {collection.media.length > 0 ? (
              <CollectionMediaGrid collection={collection} />
            ) : (
              <EmptyState
                description="Approved media will appear after it is added to this published collection."
                title="This collection is being prepared"
              />
            )}
          </CinematicReveal>
          {(offset > 0 || nextOffset !== null) && (
            <nav aria-label="Collection pages" className="mt-8 flex flex-wrap gap-3">
              {offset > 0 && (
                <Link
                  className={buttonClasses("secondary")}
                  href={`/gallery/${encodeURIComponent(id)}?offset=${Math.max(0, offset - 18)}`}
                >
                  Previous highlights
                </Link>
              )}
              {nextOffset !== null && (
                <Link
                  className={buttonClasses("secondary")}
                  href={`/gallery/${encodeURIComponent(id)}?offset=${nextOffset}`}
                >
                  More highlights
                </Link>
              )}
            </nav>
          )}
        </Container>
      </Section>
    </article>
  );
}
