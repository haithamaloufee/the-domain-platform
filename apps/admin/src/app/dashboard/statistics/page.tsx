import { SectionHeader } from "@the-domain/ui";
import { StatisticsManager } from "@/components/statistics/statistics-manager";

export default function Page() {
  return (
    <div className="mx-auto max-w-[90rem]">
      <div className="border-b border-line pb-9">
        <SectionHeader
          description="Maintain factual public figures with explicit visibility and verification controls."
          eyebrow="Verified record"
          title="Statistics"
        />
      </div>
      <section aria-labelledby="statistics-manager-title" className="pt-8">
        <h2 className="sr-only" id="statistics-manager-title">
          Managed statistics
        </h2>
        <StatisticsManager />
      </section>
    </div>
  );
}
