import {
  AboutHeroPresentation,
  MediaType,
  type AdminAboutSettings,
  type AdminTeamMember,
} from "@the-domain/types";
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") throw new Error("Invalid About response.");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid About text.");
  return value;
}
function optional(value: unknown): string | null {
  return value === null ? null : text(value);
}
function bool(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("Invalid About state.");
  return value;
}
function media(value: unknown) {
  if (value === null) return null;
  const x = record(value);
  return {
    id: text(x.id),
    mediaType: x.mediaType as MediaType,
    url: text(x.url),
    posterUrl: optional(x.posterUrl),
    altText: optional(x.altText),
  };
}
export function parseAbout(value: unknown): AdminAboutSettings | null {
  if (value === null) return null;
  const x = record(value);
  return {
    id: text(x.id),
    isPublished: bool(x.isPublished),
    isHeroEnabled: bool(x.isHeroEnabled),
    heroMediaAssetId: optional(x.heroMediaAssetId),
    heroMedia: media(x.heroMedia),
    heroPresentation: x.heroPresentation as AboutHeroPresentation,
    isStoryEnabled: bool(x.isStoryEnabled),
    isTeamEnabled: bool(x.isTeamEnabled),
    isPartnersEnabled: bool(x.isPartnersEnabled),
    isReachOutEnabled: bool(x.isReachOutEnabled),
    socialImageMediaAssetId: optional(x.socialImageMediaAssetId),
    socialImage: media(x.socialImage),
    createdAtUtc: text(x.createdAtUtc),
    updatedAtUtc: text(x.updatedAtUtc),
  };
}
export function parseTeamMember(value: unknown): AdminTeamMember {
  const x = record(value);
  return {
    id: text(x.id),
    name: text(x.name),
    role: text(x.role),
    biography: optional(x.biography),
    photoMediaAssetId: text(x.photoMediaAssetId),
    photoUrl: text(x.photoUrl),
    photoAltText: optional(x.photoAltText),
    profileUrl: optional(x.profileUrl),
    isVisible: bool(x.isVisible),
    sortOrder: Number(x.sortOrder),
    createdAtUtc: text(x.createdAtUtc),
    updatedAtUtc: text(x.updatedAtUtc),
  };
}
export function parseTeam(value: unknown) {
  if (!Array.isArray(value)) throw new Error("Invalid Team response.");
  return value.map(parseTeamMember);
}
