import { SectionHeader } from "@the-domain/ui";
import { DiscountEditor } from "@/components/operations/discount-editor";
export default function Page() {
  return (
    <div className="grid max-w-3xl gap-8">
      <SectionHeader
        title="Event discounts"
        description="Set the public terms for an event’s ticketing offer."
      />
      <DiscountEditor />
    </div>
  );
}
