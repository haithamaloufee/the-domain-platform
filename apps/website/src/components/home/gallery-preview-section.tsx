import type { HomepageCollectionPreview, PublicGalleryAlbum } from "@the-domain/types";
import { Container, EmptyState, Section, buttonClasses } from "@the-domain/ui";
import Link from "next/link";
import { AlbumCard } from "@/components/gallery/album-card";
import { CollectionCard } from "@/components/gallery/collection-card";
import { HomeSectionHeader } from "./home-section-header";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";

export function GalleryPreviewSection({
  albums,
  unavailable,
  collection,
  title,
}: {
  albums: PublicGalleryAlbum[];
  unavailable: boolean;
  collection?: HomepageCollectionPreview | null;
  title?: string;
  description?: string;
}) {
  return (
    <Section>
      <Container>
        <HomeSectionHeader
          eyebrow="Gallery Preview"
          title={title ?? "Moments with their own afterlife."}
        />
        {collection ? (
          <div className="mt-10" data-reveal="card">
            <CollectionCard collection={collection} priority={false} />
          </div>
        ) : albums.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {albums.map((album, index) => (
              <div
                className={index === 0 ? "md:col-span-2 lg:col-span-1" : undefined}
                data-reveal="card"
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
        {(collection || albums.length > 0) && (
          <div className="mt-10 text-center" data-reveal="copy">
            <Link
              className={buttonClasses(
                "secondary",
                "homepage-section-cta homepage-section-cta--prominent",
              )}
              href="/gallery"
            >
              <DynamicText kind="action">Open The Gallery</DynamicText>
            </Link>
          </div>
        )}
      </Container>
    </Section>
  );
}
