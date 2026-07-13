import { EventMediaWorkspace } from "@/components/event-media/event-media-workspace";

export default async function EventMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-[90rem]">
      <EventMediaWorkspace eventId={id} />
    </div>
  );
}
