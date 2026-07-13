import { SectionHeader } from "@the-domain/ui";
import { HomepageEditor } from "@/components/homepage/homepage-editor";

export default function Page() {
  return (
    <div className="mx-auto max-w-[90rem]">
      <div className="border-b border-line pb-9">
        <SectionHeader
          description="Shape the published homepage narrative without changing its cinematic composition."
          eyebrow="Editorial control"
          title="Homepage content"
        />
      </div>
      <section aria-labelledby="homepage-editor-title" className="pt-8">
        <h2 className="sr-only" id="homepage-editor-title">
          Homepage editor
        </h2>
        <HomepageEditor />
      </section>
    </div>
  );
}
