import { SectionHeader } from "@the-domain/ui";
import { AboutManager } from "@/components/about/about-manager";
export default function Page() {
  return (
    <div className="mx-auto max-w-[90rem]">
      <div className="border-b border-line pb-9">
        <SectionHeader
          eyebrow="Public experience"
          title="About Page & Team"
          description="Shape the company story and the people behind it through one guided visual editor."
        />
      </div>
      <section aria-label="About page editor" className="pt-8">
        <AboutManager />
      </section>
    </div>
  );
}
