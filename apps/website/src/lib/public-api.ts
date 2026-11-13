import "server-only";

import { cache } from "react";
import type {
  PublicEventDetails,
  PublicEventListItem,
  PublicGalleryAlbum,
  PublicGalleryAlbumDetails,
  GalleryPublicCollection,
  PublicHomepageResponse,
  PublicBrandingSettings,
  PublicAboutResponse,
} from "@the-domain/types";
import { getPublicApiBaseUrl } from "./environment";
import {
  parseGalleryAlbumDetails,
  parseGalleryAlbums,
  parseGalleryCollection,
  parseGalleryCollections,
  parsePublicHomepage,
  parsePublicEvent,
  parsePublicEvents,
  parsePublicBranding,
  parsePublicAbout,
} from "./public-contract";

export class PublicApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "PublicApiError";
  }
}

export const getUpcomingEvents = cache(
  (): Promise<PublicEventListItem[]> => request("/api/public/events/upcoming", parsePublicEvents),
);

export const getPreviousEvents = cache(
  (): Promise<PublicEventListItem[]> => request("/api/public/events/previous", parsePublicEvents),
);

export const getFeaturedEvents = cache(
  (): Promise<PublicEventListItem[]> => request("/api/public/events/featured", parsePublicEvents),
);

export const getEventBySlug = cache(
  (slug: string): Promise<PublicEventDetails> =>
    request(`/api/public/events/${encodeURIComponent(slug)}`, parsePublicEvent),
);

export const getGalleryAlbums = cache(
  (): Promise<PublicGalleryAlbum[]> => request("/api/public/gallery/albums", parseGalleryAlbums),
);

export const getGalleryAlbumByEventSlug = cache(
  (eventSlug: string): Promise<PublicGalleryAlbumDetails> =>
    request(
      `/api/public/gallery/albums/${encodeURIComponent(eventSlug)}`,
      parseGalleryAlbumDetails,
    ),
);

export const getGalleryCollections = cache(
  (): Promise<GalleryPublicCollection[]> =>
    request("/api/public/gallery/collections", parseGalleryCollections),
);

export const getGalleryCollection = cache(
  (id: string): Promise<GalleryPublicCollection> =>
    request(`/api/public/gallery/collections/${encodeURIComponent(id)}`, parseGalleryCollection),
);

export const getPublicHomepage = cache(
  (): Promise<PublicHomepageResponse> => request("/api/public/homepage", parsePublicHomepage),
);

export const getPublicBranding = cache(
  (): Promise<PublicBrandingSettings> => request("/api/public/branding", parsePublicBranding),
);
export const getPublicAbout = cache(
  (): Promise<PublicAboutResponse> => request("/api/public/about", parsePublicAbout),
);

async function request<T>(path: `/${string}`, parse: (value: unknown) => T): Promise<T> {
  const response = await fetch(`${getPublicApiBaseUrl().replace(/\/$/, "")}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new PublicApiError(
      response.status === 404
        ? "The requested public content was not found."
        : "Public content is temporarily unavailable.",
      response.status,
    );
  }

  try {
    return parse((await response.json()) as unknown);
  } catch (error) {
    if (error instanceof PublicApiError) throw error;
    throw new PublicApiError("The public API returned an invalid response.", 502);
  }
}
