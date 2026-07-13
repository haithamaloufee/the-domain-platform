import type { Metadata } from "next";
import { RouteIntro } from "@/components/layout/route-intro";
export const metadata: Metadata = { title: "About" };
export default function AboutPage() {
  return (
    <RouteIntro
      eyebrow="The company"
      title="About The Domain"
      description="A future editorial profile of the people, intent, and experience behind The Domain."
    />
  );
}
