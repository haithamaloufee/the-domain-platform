import { SectionHeader } from "@the-domain/ui";
import { PartnersManager } from "@/components/partners/partners-manager";

export default function Page() {
  return (
    <div className="mx-auto max-w-[90rem]">
      <div className="border-b border-line pb-9">
        <SectionHeader
          description="Curate approved partners, sponsor identities, and their public presentation order."
          eyebrow="Collaboration directory"
          title="Partners & sponsors"
        />
      </div>
      <section aria-labelledby="partners-manager-title" className="pt-8">
        <h2 className="sr-only" id="partners-manager-title">
          Managed partners
        </h2>
        <PartnersManager />
      </section>
    </div>
  );
}
