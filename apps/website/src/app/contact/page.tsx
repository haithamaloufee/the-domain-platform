import type { Metadata } from "next";
import { RouteIntro } from "@/components/layout/route-intro";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description:
    "Find the approved public contact path for The Domain Entertainment when it is published.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <RouteIntro
      eyebrow="Start a conversation"
      title="Contact"
      description="The official public contact channel will appear here when it is published. Until then, explore the events and experiences currently available through The Domain."
      actionHref="/events"
      actionLabel="Explore events"
      note="Official contact details pending publication"
    />
  );
}
