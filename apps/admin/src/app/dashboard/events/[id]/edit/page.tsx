import { SectionHeader } from "@the-domain/ui";
import { EditEventScreen } from "@/components/events/edit-event-screen";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl">
      <SectionHeader
        eyebrow="Event directory"
        title="Edit event"
        description="Update scheduling, venue, booking, and promotional placement from one controlled record."
      />
      <div className="mt-10">
        <EditEventScreen eventId={id} />
      </div>
    </div>
  );
}
