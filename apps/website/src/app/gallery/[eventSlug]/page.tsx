import type { Metadata } from "next";
import { Container, EmptyState, Section, buttonClasses } from "@the-domain/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatEventDate } from "@/components/events/event-presentation";
import { GalleryMediaGrid } from "@/components/gallery/gallery-media-grid";
import { getGalleryAlbumByEventSlug, PublicApiError } from "@/lib/public-api";

interface GalleryAlbumPageProps {
  params: Promise<{ eventSlug: string }>;
}

export async function generateMetadata({ params }: GalleryAlbumPageProps): Promise<Metadata> {
  const { eventSlug } = await params;
  try {
    const album = await getGalleryAlbumByEventSlug(eventSlug);
    return {
      title: `${album.title} Gallery`,
      description: `Approved highlights from ${album.title}.`,
    };
  } catch {
    return { title: "Event Gallery" };
  }
}

export default async function EventGalleryPage({ params }: GalleryAlbumPageProps) {
  const { eventSlug } = await params;
  let album;
  try {
    album = await getGalleryAlbumByEventSlug(eventSlug);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <article>
      <Section className="border-b border-line pb-12 sm:pb-16">
        <Container>
          <p className="font-label text-xs uppercase tracking-[0.14em] text-gold">Event album</p>
          <h1 className="mt-4 max-w-5xl font-display text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] text-ink sm:text-7xl">
            {album.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            <span>{formatEventDate(album.eventStartAtUtc, album.timeZoneId)}</span>
            <span>{album.city}</span>
            <span>{album.venueName}</span>
            <span>{album.media.length} approved highlights</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className={buttonClasses("secondary")} href="/gallery">
              Back to albums
            </Link>
            <Link className={buttonClasses("ghost")} href={`/events/${album.eventSlug}`}>
              View event details
            </Link>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          {album.media.length > 0 ? (
            <GalleryMediaGrid media={album.media} />
          ) : (
            <EmptyState
              description="Approved media for this event will appear here once published."
              title="This album is being prepared"
            />
          )}
        </Container>
      </Section>
    </article>
  );
}
