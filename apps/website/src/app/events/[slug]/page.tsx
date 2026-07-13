import type { Metadata } from "next";
import { RouteIntro } from "@/components/layout/route-intro";
export const metadata: Metadata = { title: "Event details" };
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <RouteIntro
      eyebrow="Event"
      title="Event details"
      description={`The event detail route is ready for the “${slug}” API contract and cinematic content composition.`}
    />
  );
}
