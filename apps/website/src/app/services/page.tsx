import type { Metadata } from "next";
import { RouteIntro } from "@/components/layout/route-intro";
export const metadata: Metadata = { title: "Services" };
export default function ServicesPage() {
  return (
    <RouteIntro
      eyebrow="Capabilities"
      title="Services"
      description="A future overview of The Domain’s entertainment production and event services."
    />
  );
}
