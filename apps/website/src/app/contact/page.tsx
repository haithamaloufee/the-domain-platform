import type { Metadata } from "next";
import { RouteIntro } from "@/components/layout/route-intro";

export const metadata: Metadata = { title: "Contact" };

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
