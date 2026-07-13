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
    <Section>
      <Container className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            {content.eyebrow}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-[-0.04em] text-ink sm:text-6xl">
            {content.title}
          </h2>
        </div>
        <div className="border-l border-line pl-6 lg:col-span-5 lg:pl-9">
          {partners.length ? (
            <>
              <p className="mb-6 max-w-lg text-sm leading-7 text-ink-muted">
                {content.description}
              </p>
              <ul className="grid grid-cols-2 gap-px bg-line" aria-label="Partners and sponsors">
                {partners.slice(0, 12).map((partner) => (
                  <li
                    className="flex min-h-28 items-center justify-center bg-canvas p-4"
                    key={partner.slug}
                  >
                    {partner.websiteUrl ? (
                      <a
                        className="flex h-full w-full items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-4"
                        href={partner.websiteUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <PartnerIdentity partner={partner} />
                      </a>
                    ) : (
                      <PartnerIdentity partner={partner} />
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="font-label text-[0.6875rem] uppercase tracking-[0.14em] text-ink-muted">
                Data-ready section
              </p>
              <p className="mt-4 max-w-lg text-sm leading-7 text-ink-muted sm:text-base">
                {content.description}
              </p>
            </>
          )}
        </div>
      </Container>
    </Section>
  );
}

function PartnerIdentity({ partner }: { partner: PublicPartner }) {
  return partner.logoUrl ? (
    <Image
      alt={`${partner.name} logo`}
      className="max-h-16 w-auto object-contain grayscale transition hover:grayscale-0"
      height={64}
      loader={externalImageLoader}
      src={partner.logoUrl}
      unoptimized
      width={140}
    />
  ) : (
    <span className="text-center font-label text-xs font-semibold uppercase tracking-[0.12em] text-ink">
      {partner.name}
    </span>
  );
}

function externalImageLoader({ src }: ImageLoaderProps) {
  return src;
}
