import type { Metadata } from "next";
import { RouteIntro } from "@/components/layout/route-intro";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "Discover The Domain's considered approach to entertainment, production, people, and place in Jordan.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <RouteIntro
      eyebrow="The company"
      title="About The Domain"
      description="The Domain approaches entertainment as a complete composition—atmosphere, production, people, and place working together. Its public archive preserves the experiences that are ready to be shared."
      actionHref="/gallery"
      actionLabel="Explore the archive"
    />
  );
}
