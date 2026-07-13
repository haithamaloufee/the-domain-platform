import type { Metadata } from "next";
import { RouteIntro } from "@/components/layout/route-intro";
export const metadata: Metadata = { title: "Gallery" };
export default function GalleryPage() {
  return (
    <RouteIntro
      eyebrow="Archive"
      title="Gallery"
      description="An efficient, paginated home for event photography and short-form video."
    />
  );
}
