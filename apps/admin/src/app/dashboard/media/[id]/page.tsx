import { MediaDetails } from "@/components/media/media-details";

export default async function MediaDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { id } = await params;
  const { eventId } = await searchParams;
  return (
    <div className="mx-auto max-w-[90rem]">
      <MediaDetails eventId={eventId} mediaId={id} />
    </div>
  );
}
