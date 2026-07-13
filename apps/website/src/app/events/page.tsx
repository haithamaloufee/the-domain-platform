import type { Metadata } from "next";
import { RouteIntro } from "@/components/layout/route-intro";
export const metadata: Metadata = { title: "Events" };
export default function EventsPage() {
  return (
    <RouteIntro
      eyebrow="Programme"
      title="Events"
      description="A focused catalogue for upcoming, live, finished, and cancelled Domain experiences."
    />
  );
}
