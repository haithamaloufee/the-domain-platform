import { GalleryManager } from "@/components/gallery/gallery-manager";
import { SectionHeader } from "@the-domain/ui";
export default function Page() {
  return (
    <div className="mx-auto max-w-[100rem]">
      <div className="border-b border-line pb-8">
        <SectionHeader
          eyebrow="Public curation"
          title="Gallery manager"
          description="Publish Media Library Collections, shape their presentation, and preview the visitor experience without changing original assets."
        />
      </div>
      <div className="pt-8">
        <GalleryManager />
      </div>
    </div>
  );
}
