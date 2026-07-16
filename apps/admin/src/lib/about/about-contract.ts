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
    heroEyebrow: text(x.heroEyebrow),
    heroHeading: text(x.heroHeading),
    heroText: text(x.heroText),
    heroMediaAssetId: optional(x.heroMediaAssetId),
    heroMedia: media(x.heroMedia),
    heroPresentation: x.heroPresentation as AboutHeroPresentation,
    introStatement: text(x.introStatement),
    isStoryEnabled: bool(x.isStoryEnabled),
    storyHeading: text(x.storyHeading),
    storyText: text(x.storyText),
    storyHighlight: optional(x.storyHighlight),
    isTeamEnabled: bool(x.isTeamEnabled),
    teamHeading: text(x.teamHeading),
    teamText: text(x.teamText),
    isPartnersEnabled: bool(x.isPartnersEnabled),
    partnersHeading: text(x.partnersHeading),
    partnersText: text(x.partnersText),
    isReachOutEnabled: bool(x.isReachOutEnabled),
    reachOutHeading: text(x.reachOutHeading),
    reachOutText: text(x.reachOutText),
    reachOutCtaLabel: text(x.reachOutCtaLabel),
    reachOutCtaHref: text(x.reachOutCtaHref),
    seoTitle: optional(x.seoTitle),
    seoDescription: optional(x.seoDescription),
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
