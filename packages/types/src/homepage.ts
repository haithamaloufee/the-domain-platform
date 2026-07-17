export interface PublicHomepageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string | null;
  heroDescription: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  whyTitle: string;
  whyDescription: string;
  servicesTitle: string;
  servicesDescription: string;
  partnersTitle: string;
  partnersDescription: string;
  contactTitle: string;
  contactDescription: string;
  contactCtaLabel: string;
  contactCtaHref: string;
  builder: HomepageBuilderSettings;
}
export const HomepageSectionKey = {
  Events: "events",
  Statistics: "statistics",
  Why: "why",
  Previous: "previous",
  Gallery: "gallery",
  Services: "services",
  Partners: "partners",
  Contact: "contact",
} as const;
export type HomepageSectionKey = (typeof HomepageSectionKey)[keyof typeof HomepageSectionKey];
export interface HomepageHeroMedia {
  id: string;
  mediaType: number;
  url: string;
  posterUrl: string | null;
  altText: string | null;
}
export interface HomepageBuilderSettings {
  heroMediaAssetId: string | null;
  galleryCollectionId: string | null;
  heroMedia: HomepageHeroMedia | null;
  isFloatingVideoEnabled: boolean;
  floatingVideoMediaAssetId: string | null;
  floatingVideoPosterMediaAssetId: string | null;
  floatingVideoMedia: HomepageHeroMedia | null;
  floatingVideoPoster: HomepageHeroMedia | null;
  sectionOrder: HomepageSectionKey[];
  disabledSections: HomepageSectionKey[];
  eventsTitle: string;
  eventsDescription: string;
  previousEventsTitle: string;
  previousEventsDescription: string;
  galleryTitle: string;
  galleryDescription: string;
}

export interface PublicStatisticItem {
  label: string;
  value: string;
  suffix: string | null;
  description: string | null;
}

export interface PublicPartner {
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  isFeatured: boolean;
}

export interface PublicHomepageResponse {
  content: PublicHomepageContent | null;
  statistics: PublicStatisticItem[];
  partners: PublicPartner[];
  statisticsPresentation: StatisticsPresentation;
}
export interface StatisticsPresentation {
  phrase: string;
  isEnabled: boolean;
}

export interface UpdateHomepageContentRequest extends Omit<PublicHomepageContent, "builder"> {
  isPublished: boolean;
  heroMediaAssetId: string | null;
  galleryCollectionId: string | null;
  sectionOrder: HomepageSectionKey[];
  disabledSections: HomepageSectionKey[];
  eventsTitle: string;
  eventsDescription: string;
  previousEventsTitle: string;
  previousEventsDescription: string;
  galleryTitle: string;
  galleryDescription: string;
  isFloatingVideoEnabled: boolean;
  floatingVideoMediaAssetId: string | null;
  floatingVideoPosterMediaAssetId: string | null;
}

export interface AdminHomepageContent extends PublicHomepageContent {
  id: string;
  isPublished: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface CreateStatisticRequest {
  label: string;
  value: string;
  suffix: string | null;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  isVerified: boolean;
}

export type UpdateStatisticRequest = CreateStatisticRequest;

export interface AdminStatisticItem extends CreateStatisticRequest {
  id: string;
  slotNumber: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface CreatePartnerRequest {
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  logoMediaAssetId: string | null;
}

export type UpdatePartnerRequest = CreatePartnerRequest;

export interface AdminPartner extends CreatePartnerRequest {
  id: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}
