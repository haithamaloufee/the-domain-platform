import { SectionHeader } from "@the-domain/ui";
import { EventForm } from "@/components/events/event-form";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-[96rem]">
      <SectionHeader
        eyebrow="Event directory"
        title="Create event"
        description="Follow four clear steps from public information through media, review, and an explicit publish decision."
      />
      <div className="mt-10">
        <EventForm />
      </div>
    </div>
  );
}
