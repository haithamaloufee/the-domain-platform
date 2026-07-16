import "server-only";

import type {
  PublicEventDetails,
  PublicEventListItem,
  PublicGalleryAlbum,
  PublicGalleryAlbumDetails,
  GalleryPublicCollection,
  PublicHomepageResponse,
  PublicPartner,
  PublicStatisticItem,
  PublicBrandingSettings,
} from "@the-domain/types";
import { getPublicApiBaseUrl } from "./environment";
import {
  parseGalleryAlbumDetails,
  parseGalleryAlbums,
  parseGalleryCollection,
  parseGalleryCollections,
  parsePublicHomepage,
  parsePublicPartners,
  parsePublicStatistics,
  parsePublicEvent,
  parsePublicEvents,
  parsePublicBranding,
} from "./public-contract";

const publicRevalidationSeconds = 60;

export class PublicApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "PublicApiError";
  }
}

export function getUpcomingEvents(): Promise<PublicEventListItem[]> {
  return request("/api/public/events/upcoming", parsePublicEvents);
}

export function getPreviousEvents(): Promise<PublicEventListItem[]> {
  return request("/api/public/events/previous", parsePublicEvents);
}

export function getFeaturedEvents(): Promise<PublicEventListItem[]> {
  return request("/api/public/events/featured", parsePublicEvents);
}

export function getEventBySlug(slug: string): Promise<PublicEventDetails> {
  return request(`/api/public/events/${encodeURIComponent(slug)}`, parsePublicEvent);
}

export function getGalleryAlbums(): Promise<PublicGalleryAlbum[]> {
  return request("/api/public/gallery/albums", parseGalleryAlbums);
}

export function getGalleryAlbumByEventSlug(eventSlug: string): Promise<PublicGalleryAlbumDetails> {
  return request(
    `/api/public/gallery/albums/${encodeURIComponent(eventSlug)}`,
    parseGalleryAlbumDetails,
  );
}

export function getGalleryCollections(): Promise<GalleryPublicCollection[]> {
  return request("/api/public/gallery/collections", parseGalleryCollections);
}

export function getGalleryCollection(id: string): Promise<GalleryPublicCollection> {
  return request(
    `/api/public/gallery/collections/${encodeURIComponent(id)}`,
    parseGalleryCollection,
  );
}

export function getPublicHomepage(): Promise<PublicHomepageResponse> {
  return request("/api/public/homepage", parsePublicHomepage);
}

export function getPublicStatistics(): Promise<PublicStatisticItem[]> {
  return request("/api/public/statistics", parsePublicStatistics);
}

export function getPublicPartners(): Promise<PublicPartner[]> {
  return request("/api/public/partners", parsePublicPartners);
}

export function getPublicBranding(): Promise<PublicBrandingSettings> {
  return request("/api/public/branding", parsePublicBranding);
}

async function request<T>(path: `/${string}`, parse: (value: unknown) => T): Promise<T> {
  const response = await fetch(`${getPublicApiBaseUrl().replace(/\/$/, "")}${path}`, {
    ...getCacheOptions(),
    headers: { Accept: "application/json" },
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

function getCacheOptions(): RequestInit & { next?: { revalidate: number } } {
  return process.env.NODE_ENV === "development"
    ? { cache: "no-store" }
    : { next: { revalidate: publicRevalidationSeconds } };
}
