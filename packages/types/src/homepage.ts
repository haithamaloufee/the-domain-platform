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
}

export interface UpdateHomepageContentRequest extends PublicHomepageContent {
  isPublished: boolean;
}

export interface AdminHomepageContent extends UpdateHomepageContentRequest {
  id: string;
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
}

export type UpdatePartnerRequest = CreatePartnerRequest;

export interface AdminPartner extends CreatePartnerRequest {
  id: string;
  createdAtUtc: string;
  updatedAtUtc: string;
}
