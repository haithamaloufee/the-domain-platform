import type { Metadata } from "next";
import { RouteIntro } from "@/components/layout/route-intro";
export const metadata: Metadata = { title: "Contact" };
export default function ContactPage() {
  return (
    <RouteIntro
      eyebrow="Start a conversation"
      title="Contact"
      description="A future accessible enquiry path for guests, partners, and production collaborators."
    />
  );
}
