import { SectionHeader } from "@the-domain/ui";
import { BrandingSettingsEditor } from "@/components/branding/branding-settings-editor";
export default function Page() {
  return (
    <div className="mx-auto max-w-[100rem]">
      <SectionHeader
        eyebrow="Website identity"
        title="Branding & Global Settings"
        description="Manage the public identity, default metadata, contact details, and verified social profiles from one authoritative place."
      />
      <div className="mt-8">
        <BrandingSettingsEditor />
      </div>
    </div>
  );
}
