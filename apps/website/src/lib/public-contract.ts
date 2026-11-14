import {
  BookingAvailability,
  EventDisplayStatus,
  EventMediaUsage,
  MediaOrientation,
  MediaType,
  VideoPosterMode,
  type GalleryPublicCollection,
  type GalleryPublicMedia,
  type HomepageCollectionPreview,
  type PublicEventDetails,
  type PublicEventListItem,
  type PublicGalleryAlbum,
  type PublicGalleryAlbumDetails,
  type PublicHomepageResponse,
  type PublicMediaItem,
  type PublicPartner,
  type PublicStatisticItem,
  type PublicBrandingSettings,
  type PublicAboutResponse,
  AboutHeroPresentation,
} from "@the-domain/types";

export function parsePublicAbout(value: unknown): PublicAboutResponse {
  if (
    !isRecord(value) ||
    !isRecord(value.settings) ||
    !Array.isArray(value.team) ||
    !Array.isArray(value.partners)
  )
    throw new Error("The server returned invalid About content.");
  const settings = value.settings;
  const aboutMedia = (input: unknown) => {
    if (input === null) return null;
    if (!isRecord(input)) throw new Error("Invalid About media.");
    return {
      id: requiredString(input.id),
      mediaType: enumValue(input.mediaType, MediaType),
      url: httpsUrl(input.url),
      posterUrl: nullableHttpsUrl(input.posterUrl),
      altText: nullableString(input.altText),
    };
  };
  return {
    settings: {
      isHeroEnabled: booleanValue(settings.isHeroEnabled),
      heroMedia: aboutMedia(settings.heroMedia),
      heroPresentation: enumValue(settings.heroPresentation, AboutHeroPresentation),
      isStoryEnabled: booleanValue(settings.isStoryEnabled),
      isTeamEnabled: booleanValue(settings.isTeamEnabled),
      isPartnersEnabled: booleanValue(settings.isPartnersEnabled),
      isReachOutEnabled: booleanValue(settings.isReachOutEnabled),
      socialImageUrl: nullableHttpsUrl(settings.socialImageUrl),
    },
    team: value.team.map((input) => {
      if (!isRecord(input)) throw new Error("Invalid Team member.");
      return {
        id: requiredString(input.id),
        name: requiredString(input.name),
        role: requiredString(input.role),
        biography: nullableString(input.biography),
        photoUrl: httpsUrl(input.photoUrl),
        photoAltText: nullableString(input.photoAltText),
        profileUrl: nullableHttpsUrl(input.profileUrl),
      };
    }),
    partners: parsePublicPartners(value.partners),
  };
}
import {
  defaultEventCoverPresentation,
  isValidEventCoverPresentation,
  safeGalleryLayoutPreset,
} from "@the-domain/utils";

export function parsePublicBranding(value: unknown): PublicBrandingSettings {
  if (!isRecord(value)) throw new Error("The server returned invalid branding settings.");
  return {
    primaryLogo: brandingMedia(value.primaryLogo),
    alternateLogo: brandingMedia(value.alternateLogo),
    favicon: brandingMedia(value.favicon),
    socialImage: brandingMedia(value.socialImage),
    publicEmail: nullableString(value.publicEmail),
    publicPhone: nullableString(value.publicPhone),
    whatsApp: nullableString(value.whatsApp),
    publicAddress: nullableString(value.publicAddress),
    socialLinks: brandingLinks(value.socialLinks),
  };
}
function brandingMedia(value: unknown) {
  if (value === null) return null;
  if (!isRecord(value)) throw new Error("Invalid branding image.");
  return {
    id: requiredString(value.id),
    url: httpsUrl(value.url),
    altText: nullableString(value.altText),
    width: nullableNumber(value.width),
    height: nullableNumber(value.height),
  };
}
function brandingLinks(value: unknown): Record<string, string> {
  if (!isRecord(value)) throw new Error("Invalid social links.");
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, httpsUrl(item)]));
}

export function parseGalleryCollections(value: unknown): GalleryPublicCollection[] {
  if (!Array.isArray(value)) throw new Error("The server returned an invalid collection list.");
  return value.map(parseGalleryCollection);
}

export function parseGalleryCollectionSummaries(value: unknown): HomepageCollectionPreview[] {
  if (!Array.isArray(value)) throw new Error("Invalid gallery collection summaries.");
  return value.map(parseCollectionSummary);
}

export function parseGalleryCollection(value: unknown): GalleryPublicCollection {
  if (!isRecord(value)) throw new Error("The server returned an invalid gallery collection.");
  return {
    id: requiredString(value.id),
    title: requiredString(value.title),
    description: nullableString(value.description),
    layoutPreset: safeGalleryLayoutPreset(value.layoutPreset),
    featuredMediaId: nullableString(value.featuredMediaId),
    media: galleryMediaList(value.media),
  };
}

function galleryMediaList(value: unknown): GalleryPublicMedia[] {
  if (!Array.isArray(value)) throw new Error("Expected gallery media.");
  return value.map((item) => {
    if (!isRecord(item)) throw new Error("Expected a gallery media item.");
    return {
      id: requiredString(item.id),
      mediaType: enumValue(item.mediaType, MediaType),
      url: httpsUrl(item.url),
      posterUrl: nullableHttpsUrl(item.posterUrl),
      caption: nullableString(item.caption),
      altText: nullableString(item.altText),
      orientation: enumValue(item.orientation, MediaOrientation),
      width: nullableNumber(item.width),
      height: nullableNumber(item.height),
      durationSeconds: nullableNumber(item.durationSeconds),
      sortOrder: integer(item.sortOrder),
    };
  });
}

export function parsePublicHomepage(value: unknown): PublicHomepageResponse {
  if (!isRecord(value) || !isRecord(value.presentation) || !Array.isArray(value.statistics))
    throw new Error("The server returned invalid homepage content.");
  const presentation = value.presentation;
  return {
    presentation: {
      heroMedia:
        presentation.heroMedia === null ? null : parseHomepageMedia(presentation.heroMedia),
      floatingVideo: parseFloatingVideo(presentation.floatingVideo),
      statisticsMotionEnabled: booleanValue(presentation.statisticsMotionEnabled),
    },
    statistics: value.statistics.map((item) => {
      if (!isRecord(item)) throw new Error("Invalid homepage statistic.");
      const slotNumber = integer(item.slotNumber);
      if (![1, 2, 3, 4].includes(slotNumber)) throw new Error("Invalid statistic slot.");
      return {
        slotNumber: slotNumber as 1 | 2 | 3 | 4,
        value: requiredString(item.value),
        suffix: nullableString(item.suffix),
      };
    }),
    currentEvents: parsePublicEvents(value.currentEvents),
    previousEvents: parsePublicEvents(value.previousEvents),
    galleryPreview: parseHomepageGalleryPreview(value.galleryPreview),
    partners: parsePublicPartners(value.partners),
  };
}

function parseFloatingVideo(value: unknown) {
  if (value === null) return null;
  if (!isRecord(value)) throw new Error("Invalid homepage floating video.");
  return {
    video: parseHomepageMedia(value.video),
    poster: value.poster === null ? null : parseHomepageMedia(value.poster),
  };
}

function parseHomepageGalleryPreview(value: unknown): PublicHomepageResponse["galleryPreview"] {
  if (value === null) return null;
  if (!isRecord(value) || (value.kind !== "collection" && value.kind !== "albums"))
    throw new Error("Invalid homepage gallery preview.");
  if (value.kind === "albums") return { kind: "albums", albums: parseGalleryAlbums(value.albums) };
  return parseCollectionSummary(value.collection);
}

function parseCollectionSummary(collection: unknown): HomepageCollectionPreview {
  if (!isRecord(collection)) throw new Error("Invalid collection summary.");
  return {
    kind: "collection",
    id: requiredString(collection.id),
    title: requiredString(collection.title),
    description: nullableString(collection.description),
    layoutPreset: safeGalleryLayoutPreset(collection.layoutPreset),
    highlightCount: integer(collection.highlightCount),
    photoCount: integer(collection.photoCount),
    videoCount: integer(collection.videoCount),
    coverMedia: collection.coverMedia === null ? null : parseHomepageMedia(collection.coverMedia),
  };
}

export function parsePublicStatistics(value: unknown): PublicStatisticItem[] {
  if (!Array.isArray(value)) throw new Error("The server returned invalid statistics.");
  return value.map((item) => {
    if (!isRecord(item)) throw new Error("The server returned an invalid statistic.");
    return {
      label: requiredString(item.label),
      value: requiredString(item.value),
      suffix: nullableString(item.suffix),
      description: nullableString(item.description),
    };
  });
}

export function parsePublicPartners(value: unknown): PublicPartner[] {
  if (!Array.isArray(value)) throw new Error("The server returned invalid partners.");
  return value.map((item) => {
    if (!isRecord(item)) throw new Error("The server returned an invalid partner.");
    return {
      name: requiredString(item.name),
      slug: requiredString(item.slug),
      logoUrl: nullableUrl(item.logoUrl),
      websiteUrl: nullableUrl(item.websiteUrl),
      description: nullableString(item.description),
      isFeatured: booleanValue(item.isFeatured),
    };
  });
}

function parseHomepageMedia(value: unknown) {
  if (!isRecord(value)) throw new Error("Invalid homepage hero media.");
  return {
    id: requiredString(value.id),
    mediaType: enumValue(value.mediaType, MediaType),
    url: httpsUrl(value.url),
    posterUrl: nullableHttpsUrl(value.posterUrl),
    altText: nullableString(value.altText),
  };
}

export function parsePublicEvents(value: unknown): PublicEventListItem[] {
  if (!Array.isArray(value)) throw new Error("The server returned an invalid event list.");
  return value.map(parsePublicEventListItem);
}

function parsePublicEventListItem(value: unknown): PublicEventListItem {
  if (!isRecord(value)) throw new Error("The server returned an invalid event summary.");
  return {
    ...eventSummary(value),
    coverMedia: value.coverMedia === null ? null : mediaItem(value.coverMedia),
  };
}

export function parsePublicEvent(value: unknown): PublicEventDetails {
  if (!isRecord(value)) throw new Error("The server returned invalid event details.");
  return {
    ...eventSummary(value),
    longDescription: stringValue(value.longDescription),
    venueAddress: nullableString(value.venueAddress),
    mapUrl: nullableUrl(value.mapUrl),
    bookingClosesAtUtc:
      value.bookingClosesAtUtc == null ? null : dateString(value.bookingClosesAtUtc),
    media: mediaList(value.media),
    coverMedia: value.coverMedia === null ? null : mediaItem(value.coverMedia),
  };
}

function eventSummary(value: Record<string, unknown>): Omit<PublicEventListItem, "coverMedia"> {
  return {
    id: requiredString(value.id),
    slug: requiredString(value.slug),
    title: requiredString(value.title),
    shortDescription: stringValue(value.shortDescription),
    eventType: requiredString(value.eventType),
    startAtUtc: dateString(value.startAtUtc),
    endAtUtc: dateString(value.endAtUtc),
    timeZoneId: requiredString(value.timeZoneId),
    city: requiredString(value.city),
    venueName: requiredString(value.venueName),
    displayStatus: enumValue(value.displayStatus, EventDisplayStatus),
    bookingAvailability: enumValue(value.bookingAvailability, BookingAvailability),
    externalBookingUrl: nullableUrl(value.externalBookingUrl),
  };
}

export function parseGalleryAlbums(value: unknown): PublicGalleryAlbum[] {
  if (!Array.isArray(value)) throw new Error("The server returned an invalid gallery list.");
  return value.map(parseGalleryAlbum);
}

export function parseGalleryAlbum(value: unknown): PublicGalleryAlbum {
  if (!isRecord(value)) throw new Error("The server returned an invalid gallery album.");
  return {
    eventId: requiredString(value.eventId),
    eventSlug: requiredString(value.eventSlug),
    title: requiredString(value.title),
    eventStartAtUtc: dateString(value.eventStartAtUtc),
    timeZoneId: requiredString(value.timeZoneId),
    city: requiredString(value.city),
    venueName: requiredString(value.venueName),
    mediaCount: integer(value.mediaCount),
    photoCount: integer(value.photoCount),
    videoCount: integer(value.videoCount),
    coverMedia: mediaItem(value.coverMedia),
  };
}

export function parseGalleryAlbumDetails(value: unknown): PublicGalleryAlbumDetails {
  if (!isRecord(value)) throw new Error("The server returned invalid gallery album details.");
  return {
    eventId: requiredString(value.eventId),
    eventSlug: requiredString(value.eventSlug),
    title: requiredString(value.title),
    eventStartAtUtc: dateString(value.eventStartAtUtc),
    timeZoneId: requiredString(value.timeZoneId),
    city: requiredString(value.city),
    venueName: requiredString(value.venueName),
    media: mediaList(value.media),
  };
}

function mediaList(value: unknown): PublicMediaItem[] {
  if (!Array.isArray(value)) throw new Error("Expected a media list.");
  return value.map(mediaItem);
}

function mediaItem(item: unknown): PublicMediaItem {
  if (!isRecord(item)) throw new Error("Expected a media item.");
  return {
    id: requiredString(item.id),
    mediaType: enumValue(item.mediaType, MediaType),
    url: absoluteUrl(item.url),
    thumbnailUrl: nullableUrl(item.thumbnailUrl),
    caption: nullableString(item.caption),
    altText: nullableString(item.altText),
    width: nullableNumber(item.width),
    height: nullableNumber(item.height),
    durationSeconds: nullableNumber(item.durationSeconds),
    orientation: enumValue(item.orientation, MediaOrientation),
    usage: enumValue(item.usage, EventMediaUsage),
    sortOrder: integer(item.sortOrder),
    isFeatured: booleanValue(item.isFeatured),
    presentation: parsePresentation(item.presentation),
    videoPoster: parseVideoPoster(item.videoPoster),
  };
}

function parsePresentation(value: unknown) {
  if (value === undefined || value === null) return { ...defaultEventCoverPresentation };
  if (!isValidEventCoverPresentation(value))
    throw new Error("Expected valid cover presentation settings.");
  return { ...value };
}

function parseVideoPoster(value: unknown) {
  if (!isRecord(value)) {
    return {
      mode: VideoPosterMode.Automatic,
      timestampSeconds: null,
      customPosterMediaAssetId: null,
      posterUrl: null,
    };
  }
  return {
    mode: enumValue(value.mode, VideoPosterMode),
    timestampSeconds: nullableNumber(value.timestampSeconds),
    customPosterMediaAssetId: nullableString(value.customPosterMediaAssetId),
    posterUrl: nullableUrl(value.posterUrl),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown): string {
  const result = stringValue(value);
  if (!result) throw new Error("Expected a non-empty string.");
  return result;
}

function stringValue(value: unknown): string {
  if (typeof value !== "string") throw new Error("Expected a string.");
  return value;
}

function nullableString(value: unknown): string | null {
  return value === null ? null : stringValue(value);
}

function integer(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value))
    throw new Error("Expected an integer.");
  return value;
}

function nullableNumber(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Expected a number.");
  return value;
}

function booleanValue(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("Expected a boolean.");
  return value;
}

function dateString(value: unknown): string {
  const result = requiredString(value);
  if (Number.isNaN(new Date(result).getTime())) throw new Error("Expected a date string.");
  return result;
}

function absoluteUrl(value: unknown): string {
  const result = requiredString(value);
  const url = new URL(result);
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error("Expected an HTTP media URL.");
  return result;
}

function nullableUrl(value: unknown): string | null {
  return value === null ? null : absoluteUrl(value);
}

function httpsUrl(value: unknown): string {
  const result = absoluteUrl(value);
  if (new URL(result).protocol !== "https:") throw new Error("Expected an HTTPS media URL.");
  return result;
}

function nullableHttpsUrl(value: unknown): string | null {
  return value === null ? null : httpsUrl(value);
}

function enumValue<T extends Record<string, number>>(value: unknown, values: T): T[keyof T] {
  if (Object.values(values).includes(value as number)) return value as T[keyof T];
  throw new Error("Expected an enum value.");
}
