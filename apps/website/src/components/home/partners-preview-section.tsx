import type { PublicHomepageContent, PublicPartner } from "@the-domain/types";
import { Container, Section } from "@the-domain/ui";
import Image, { type ImageLoaderProps } from "next/image";
import { homepageContent } from "@/content/homepage-content";

export function PartnersPreviewSection({
  cmsContent,
  partners,
}: {
  cmsContent: PublicHomepageContent | null;
  partners: PublicPartner[];
}) {
  const content = {
    eyebrow: homepageContent.partners.eyebrow,
    title: cmsContent?.partnersTitle ?? homepageContent.partners.title,
    description: cmsContent?.partnersDescription ?? homepageContent.partners.emptyMessage,
  };
  return (
    <Section className="overflow-hidden bg-canvas">
      <Container className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(20rem,0.45fr)] lg:items-end">
        <div>
          <p className="type-eyebrow text-gold">{content.eyebrow}</p>
          <h2 className="type-section-heading mt-4 max-w-3xl text-ink">{content.title}</h2>
        </div>
        <p className="max-w-lg text-sm leading-7 text-ink-muted sm:text-base lg:justify-self-end">
          {content.description}
        </p>
      </Container>

      {partners.length ? (
        <div className="partner-marquees mt-12 space-y-5 sm:mt-16 sm:space-y-7">
          {["forward", "reverse", "forward-slow"].map((direction, rowIndex) => (
            <div
              aria-hidden={rowIndex === 0 ? undefined : true}
              className={`partner-marquee partner-marquee--${direction}`}
              key={direction}
            >
              <ul
                aria-label={rowIndex === 0 ? "Partners and sponsors" : undefined}
                className="partner-marquee__track"
              >
                <PartnerSequence partners={partners} interactive={rowIndex === 0} />
                <PartnerSequence clone partners={partners} />
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <Container className="mt-10">
          <p className="type-eyebrow text-ink-muted">Partner profiles are being prepared</p>
        </Container>
      )}
    </Section>
  );
}

function PartnerSequence({
  partners,
  clone = false,
  interactive = false,
}: {
  partners: PublicPartner[];
  clone?: boolean;
  interactive?: boolean;
}) {
  const displayPartners = Array.from(
    { length: Math.max(partners.length, 8) },
    (_, index) => partners[index % partners.length]!,
  );
  return (
    <li
      aria-hidden={clone || !interactive ? true : undefined}
      className="partner-marquee__sequence"
    >
      {displayPartners.map((partner, index) => {
        const original = index < partners.length;
        const identity = <PartnerIdentity partner={partner} />;
        return partner.websiteUrl && interactive && original ? (
          <a
            className="partner-mark focus-visible:outline-2 focus-visible:outline-offset-4"
            href={partner.websiteUrl}
            key={`${partner.slug}-${index}`}
            rel="noreferrer noopener"
            target="_blank"
          >
            {identity}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <span
            aria-hidden={!original || !interactive ? true : undefined}
            className="partner-mark"
            key={`${partner.slug}-${index}`}
          >
            {identity}
          </span>
        );
      })}
    </li>
  );
}

function PartnerIdentity({ partner }: { partner: PublicPartner }) {
  return partner.logoUrl ? (
    <Image
      alt={`${partner.name} logo`}
      className="max-h-12 w-auto max-w-40 object-contain grayscale transition duration-500 hover:grayscale-0 sm:max-h-16 sm:max-w-48"
      height={64}
      loader={externalImageLoader}
      src={partner.logoUrl}
      unoptimized
      width={180}
    />
  ) : (
    <span className="text-center font-label text-sm font-semibold uppercase tracking-[0.12em] text-ink">
      {partner.name}
    </span>
  );
}

function externalImageLoader({ src }: ImageLoaderProps) {
  return src;
}
