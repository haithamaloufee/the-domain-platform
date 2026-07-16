import type { GalleryPublicCollection, PublicGalleryAlbum } from "@the-domain/types";
import { Container, EmptyState, Section } from "@the-domain/ui";
import { AlbumCard } from "@/components/gallery/album-card";
import { CollectionCard } from "@/components/gallery/collection-card";
import { HomeSectionHeader } from "./home-section-header";

export function GalleryPreviewSection({
  albums,
  unavailable,
  collection,
  title,
  description,
}: {
  albums: PublicGalleryAlbum[];
  unavailable: boolean;
  collection?: GalleryPublicCollection | null;
  title?: string;
  description?: string;
}) {
  return (
    <Section>
      <Container>
        <HomeSectionHeader
          actionHref="/gallery"
          actionLabel="Open The Gallery"
          description={
            description ??
            "A focused selection of approved event albums, using cover imagery only until a visitor chooses to enter the full gallery."
          }
          eyebrow="Gallery Preview"
          title={title ?? "Moments with their own afterlife."}
        />
        {collection ? (
          <div className="mt-10">
            <CollectionCard collection={collection} priority={false} />
          </div>
        ) : albums.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {albums.map((album, index) => (
              <div
                className={index === 0 ? "md:col-span-2 lg:col-span-1" : undefined}
                key={album.eventId}
              >
                <AlbumCard album={album} compact headingLevel="h3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              description={
                unavailable
                  ? "Public gallery albums could not be reached. Please try again shortly."
                  : "Approved event albums will appear here when they are ready."
              }
              title={
                unavailable
                  ? "The gallery is temporarily off screen"
                  : "Gallery moments are being selected"
              }
            />
          </div>
        )}
      </Container>
    </Section>
  );
}
