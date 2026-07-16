import { AboutHeroPresentation, MediaType, type PublicAboutResponse } from "@the-domain/types";
import { Container, Section, buttonClasses } from "@the-domain/ui";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublicAbout, getPublicBranding } from "@/lib/public-api";
import { createPageMetadata, defaultDescription } from "@/lib/seo";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const [about, branding] = await Promise.allSettled([getPublicAbout(), getPublicBranding()]);
  const settings = about.status === "fulfilled" ? about.value.settings : null;
  const brand = branding.status === "fulfilled" ? branding.value : null;
  return createPageMetadata({
    title: settings?.seoTitle ?? brand?.defaultSeoTitle ?? "About",
    description: settings?.seoDescription ?? brand?.defaultSeoDescription ?? defaultDescription,
    image: settings?.socialImageUrl ?? brand?.socialImage?.url ?? null,
    path: "/about",
  });
}
export default async function AboutPage() {
  let data: PublicAboutResponse;
  try {
    data = await getPublicAbout();
  } catch {
    data = fallback;
  }
  const { settings } = data;
  return (
    <main>
      {settings.isHeroEnabled && (
        <section
          className={`relative isolate overflow-hidden border-b border-line ${settings.heroPresentation === AboutHeroPresentation.MinimalStatement ? "min-h-[34rem]" : "min-h-[70svh]"}`}
        >
          <HeroMedia media={settings.heroMedia} />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-canvas via-canvas/65 to-canvas/20" />
          <Container className="flex min-h-[inherit] items-end py-20">
            <div className="max-w-5xl">
              <p className="font-label text-xs uppercase tracking-[.16em] text-gold">
                {settings.heroEyebrow}
              </p>
              <h1 className="mt-5 break-words font-display text-[clamp(3.5rem,11vw,8rem)] font-bold leading-[.9] tracking-[-.06em]">
                {settings.heroHeading}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-ink-muted">{settings.heroText}</p>
            </div>
          </Container>
        </section>
      )}
      <Section>
        <Container>
          <p className="max-w-6xl break-words font-display text-4xl font-bold leading-tight tracking-[-.04em] sm:text-7xl">
            {settings.introStatement}
          </p>
        </Container>
      </Section>
      {settings.isStoryEnabled && (
        <Section className="border-y border-line bg-surface/25">
          <Container className="grid gap-10 lg:grid-cols-12">
            <h2 className="break-words font-display text-4xl font-bold lg:col-span-5 sm:text-6xl">
              {settings.storyHeading}
            </h2>
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="whitespace-pre-line text-base leading-8 text-ink-muted">
                {settings.storyText}
              </div>
              {settings.storyHighlight && (
                <blockquote className="mt-8 border-l border-gold pl-5 font-display text-2xl font-bold">
                  {settings.storyHighlight}
                </blockquote>
              )}
            </div>
          </Container>
        </Section>
      )}
      {settings.isTeamEnabled && (
        <Section>
          <Container>
            <h2 className="max-w-4xl break-words font-display text-4xl font-bold sm:text-6xl">
              {settings.teamHeading}
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-ink-muted">{settings.teamText}</p>
            {data.team.length ? (
              <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.team.map((person) => (
                  <li className="overflow-hidden border border-line bg-surface" key={person.id}>
                    <div className="relative aspect-[4/5]">
                      <Image
                        alt={person.photoAltText ?? `${person.name}, ${person.role}`}
                        className="object-cover"
                        fill
                        sizes="(max-width:640px) 100vw, 33vw"
                        src={person.photoUrl}
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="break-words font-display text-2xl font-bold">{person.name}</h3>
                      <p className="mt-1 break-words text-sm text-gold">{person.role}</p>
                      {person.biography && (
                        <p className="mt-3 text-sm leading-6 text-ink-muted">{person.biography}</p>
                      )}
                      {person.profileUrl && (
                        <a
                          className="mt-4 inline-block text-sm underline underline-offset-4"
                          href={person.profileUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Public profile{" "}
                          <span className="sr-only">for {person.name} (opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-10 border border-line p-6 text-ink-muted">
                Team profiles are being prepared.
              </p>
            )}
          </Container>
        </Section>
      )}
      {settings.isPartnersEnabled && (
        <Section className="border-y border-line">
          <Container>
            <h2 className="max-w-4xl break-words font-display text-4xl font-bold sm:text-6xl">
              {settings.partnersHeading}
            </h2>
            <p className="mt-4 max-w-2xl text-ink-muted">{settings.partnersText}</p>
            {data.partners.length > 0 && (
              <ul className="mt-8 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-4">
                {data.partners.map((partner) => (
                  <li className="grid min-h-28 place-items-center bg-canvas p-4" key={partner.slug}>
                    {partner.logoUrl ? (
                      <Image
                        alt={`${partner.name} logo`}
                        height={64}
                        src={partner.logoUrl}
                        unoptimized
                        width={140}
                      />
                    ) : (
                      <span className="text-center text-sm font-semibold">{partner.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Container>
        </Section>
      )}
      {settings.isReachOutEnabled && (
        <Section className="architectural-grid bg-surface">
          <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="max-w-5xl break-words font-display text-5xl font-bold sm:text-7xl">
                {settings.reachOutHeading}
              </h2>
              <p className="mt-5 max-w-2xl text-lg text-ink-muted">{settings.reachOutText}</p>
            </div>
            <Link
              className={buttonClasses("primary", "w-full sm:w-auto")}
              href={settings.reachOutCtaHref}
            >
              {settings.reachOutCtaLabel}
            </Link>
          </Container>
        </Section>
      )}
    </main>
  );
}
function HeroMedia({ media }: { media: PublicAboutResponse["settings"]["heroMedia"] }) {
  if (!media)
    return (
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_70%_20%,rgba(212,175,55,.14),transparent_35%)]"
      />
    );
  return media.mediaType === MediaType.Video ? (
    <video
      aria-hidden
      autoPlay
      className="absolute inset-0 -z-20 h-full w-full object-cover"
      loop
      muted
      playsInline
      poster={media.posterUrl ?? undefined}
      preload="metadata"
      src={media.url}
    />
  ) : (
    <Image
      alt=""
      aria-hidden
      className="-z-20 object-cover"
      fill
      priority
      sizes="100vw"
      src={media.url}
    />
  );
}
const fallback: PublicAboutResponse = {
  settings: {
    isHeroEnabled: true,
    heroEyebrow: "The company",
    heroHeading: "About The Domain",
    heroText: "Entertainment composed with intention.",
    heroMedia: null,
    heroPresentation: AboutHeroPresentation.EditorialSplit,
    introStatement:
      "We shape experiences where atmosphere, production, people, and place move as one.",
    isStoryEnabled: true,
    storyHeading: "A considered approach to entertainment.",
    storyText:
      "The Domain brings creative direction and operational detail into one clear experience.",
    storyHighlight: null,
    isTeamEnabled: true,
    teamHeading: "The people behind the experience.",
    teamText: "A focused team connecting vision with execution.",
    isPartnersEnabled: false,
    partnersHeading: "Built with trusted partners.",
    partnersText: "Relationships that strengthen every production.",
    isReachOutEnabled: true,
    reachOutHeading: "Let’s create what comes next.",
    reachOutText: "Talk to The Domain about your next experience.",
    reachOutCtaLabel: "Reach out",
    reachOutCtaHref: "/contact",
    seoTitle: null,
    seoDescription: null,
    socialImageUrl: null,
  },
  team: [],
  partners: [],
};
