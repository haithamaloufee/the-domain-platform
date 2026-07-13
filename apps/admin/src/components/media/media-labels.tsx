import {
  EventMediaUsage,
  MediaApprovalStatus,
  MediaOrientation,
  MediaType,
  type EventMediaUsageValue,
  type MediaApprovalStatusValue,
  type MediaOrientationValue,
  type MediaTypeValue,
} from "@the-domain/types";
import { Badge } from "@the-domain/ui";

export const mediaTypeLabels: Record<MediaTypeValue, string> = {
  [MediaType.Image]: "Image",
  [MediaType.Video]: "Video",
};

export const orientationLabels: Record<MediaOrientationValue, string> = {
  [MediaOrientation.Unknown]: "Unknown",
  [MediaOrientation.Portrait]: "Portrait",
  [MediaOrientation.Landscape]: "Landscape",
  [MediaOrientation.Square]: "Square",
};

export const approvalLabels: Record<MediaApprovalStatusValue, string> = {
  [MediaApprovalStatus.Draft]: "Draft",
  [MediaApprovalStatus.Approved]: "Approved",
  [MediaApprovalStatus.Hidden]: "Hidden",
};

export const eventMediaUsageLabels: Record<EventMediaUsageValue, string> = {
  [EventMediaUsage.Hero]: "Hero",
  [EventMediaUsage.Cover]: "Cover",
  [EventMediaUsage.Poster]: "Poster",
  [EventMediaUsage.Gallery]: "Gallery",
  [EventMediaUsage.Thumbnail]: "Thumbnail",
  [EventMediaUsage.HomepagePreview]: "Homepage preview",
  [EventMediaUsage.PreviousEventPreview]: "Previous event preview",
};

export const eventMediaUsageValues = Object.values(EventMediaUsage) as EventMediaUsageValue[];

export function MediaApprovalBadge({ status }: { status: MediaApprovalStatusValue }) {
  return (
    <Badge
      className={
        status === MediaApprovalStatus.Approved
          ? "border-gold text-gold"
          : status === MediaApprovalStatus.Hidden
            ? "border-error/60 text-error"
            : undefined
      }
    >
      {approvalLabels[status]}
    </Badge>
  );
}
