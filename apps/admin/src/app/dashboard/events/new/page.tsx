import { SectionHeader } from "@the-domain/ui";
import { EventForm } from "@/components/events/event-form";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <SectionHeader
        eyebrow="Event directory"
        title="Create event"
        description="Build the event record now, then publish it when every public detail is ready."
      />
      <div className="mt-10">
        <EventForm />
      </div>
    </div>
  );
}
