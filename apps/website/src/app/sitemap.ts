import type { MetadataRoute } from "next";
import {
  getFeaturedEvents,
  getGalleryCollections,
  getPreviousEvents,
  getUpcomingEvents,
} from "@/lib/public-api";
import { getWebsiteUrl } from "@/lib/seo";

const staticRoutes = ["", "/events", "/gallery", "/about", "/services", "/contact"] as const;

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getWebsiteUrl();
  const [upcoming, previous, featured, collections] = await Promise.allSettled([
    getUpcomingEvents(),
    getPreviousEvents(),
    getFeaturedEvents(),
    getGalleryCollections(),
  ]);

  const eventSlugs = new Set(
    [upcoming, previous, featured]
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
      .map((event) => event.slug),
  );
  const collectionIds = new Set(
    collections.status === "fulfilled" ? collections.value.map((collection) => collection.id) : [],
  );

  return [
    ...staticRoutes.map((path, index) => ({
      url: new URL(path || "/", origin).toString(),
      changeFrequency: index === 0 ? ("weekly" as const) : ("monthly" as const),
      priority: index === 0 ? 1 : path === "/events" || path === "/gallery" ? 0.9 : 0.6,
    })),
    ...[...eventSlugs].map((slug) => ({
      url: new URL(`/events/${encodeURIComponent(slug)}`, origin).toString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...[...collectionIds].map((id) => ({
      url: new URL(`/gallery/${encodeURIComponent(id)}`, origin).toString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
