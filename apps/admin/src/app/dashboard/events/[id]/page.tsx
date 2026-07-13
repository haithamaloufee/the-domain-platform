import { EventDetails } from "@/components/events/event-details";

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-[90rem]">
      <EventDetails eventId={id} />
    </div>
  );
}
