import type { Metadata } from "next";
import { RouteIntro } from "@/components/layout/route-intro";
export const metadata: Metadata = { title: "Event gallery" };
export default async function EventGalleryPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  return (
    <RouteIntro
      eyebrow="Event archive"
      title="Gallery collection"
      description={`The “${eventSlug}” collection route is prepared for paginated media metadata.`}
    />
  );
}
