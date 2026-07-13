import { SectionHeader } from "@the-domain/ui";
import { MediaWorkspace } from "@/components/media/media-workspace";

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;
  return (
    <div className="mx-auto max-w-[90rem]">
      <div className="border-b border-line pb-9">
        <SectionHeader
          eyebrow="Asset operations"
          title="Media library"
          description="Upload, review, classify, and connect The Domain’s visual archive without exposing storage credentials."
        />
      </div>
      <MediaWorkspace eventId={eventId} />
    </div>
  );
}
