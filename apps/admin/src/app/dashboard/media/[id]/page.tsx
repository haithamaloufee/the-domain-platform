import { MediaDetails } from "@/components/media/media-details";

export default async function MediaDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-[90rem]">
      <MediaDetails mediaId={id} />
    </div>
  );
}
