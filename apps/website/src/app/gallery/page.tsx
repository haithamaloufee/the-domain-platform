import type { Metadata } from "next";
import { Container, EmptyState, Section, SectionHeader } from "@the-domain/ui";
import { AlbumCard } from "@/components/gallery/album-card";
import { getGalleryAlbums } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore approved photography and film from previous Domain events.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const albums = await loadAlbums();
  return (
    <>
      <Section className="architectural-grid border-b border-line pb-12 sm:pb-16">
        <Container>
          <SectionHeader
            description="Photography and film from the experiences that continue to define The Domain."
            eyebrow="Event archive"
            title="Gallery"
          />
        </Container>
      </Section>
      <Section className="cinematic-reveal">
        <Container>
          {albums === null ? (
            <EmptyState
              description="The gallery archive could not be reached. Please try again shortly."
              title="The archive is temporarily off screen"
            />
          ) : albums.length === 0 ? (
            <EmptyState
              description="Approved event albums will appear here after they are published."
              title="No gallery albums yet"
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {albums.map((album, index) => (
                <AlbumCard album={album} key={album.eventId} priority={index < 2} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

async function loadAlbums() {
  try {
    return await getGalleryAlbums();
  } catch {
    return null;
  }
}
