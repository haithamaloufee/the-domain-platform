import "server-only";

import { MediaType, type PublicMediaItem } from "@the-domain/types";
import type { Metadata } from "next";

export const siteName = "The Domain Entertainment";
export const defaultDescription = "Premium entertainment experiences and events in Jordan.";

const localWebsiteUrl = new URL("http://localhost:3000");

export function getWebsiteUrl(): URL {
  return getConfiguredWebsiteUrl() ?? localWebsiteUrl;
}

export function getConfiguredWebsiteUrl(): URL | null {
  const value = process.env.NEXT_PUBLIC_WEBSITE_URL?.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_WEBSITE_URL must be an absolute URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_WEBSITE_URL must use HTTP or HTTPS.");
  }

  return new URL(url.origin);
}

export function createPageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: `/${string}` | "/";
  image?: string | null;
  noIndex?: boolean;
}): Metadata {
  const images = image ? [{ url: image }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: path,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export function getPublicMediaSeoImage(media: PublicMediaItem | null | undefined): string | null {
  if (!media) return null;
  return media.mediaType === MediaType.Image ? media.url : media.thumbnailUrl;
}

export function getFirstPublicMediaSeoImage(
  media: ReadonlyArray<PublicMediaItem | null | undefined>,
): string | null {
  for (const item of media) {
    const image = getPublicMediaSeoImage(item);
    if (image) return image;
  }
  return null;
}
