import type { PublicEventListItem, PublicHomepageContent } from "@the-domain/types";
import { Badge, Container, buttonClasses } from "@the-domain/ui";
import Image from "next/image";
import Link from "next/link";
import { formatEventDate, mediaImageSource } from "@/components/events/event-presentation";
import { homepageContent } from "@/content/homepage-content";

export function HomeHero({
  content,
  featuredEvent,
}: {
  content: PublicHomepageContent | null;
  featuredEvent: PublicEventListItem | null;
}) {
  const source = mediaImageSource(featuredEvent?.coverMedia ?? null);
  const hero = content
    ? {
        eyebrow: content.heroEyebrow,
        headline: content.heroTitle,
        accent: content.heroAccent,
        description: content.heroDescription,
        primaryLabel: content.primaryCtaLabel,
        primaryHref: content.primaryCtaHref,
        secondaryLabel: content.secondaryCtaLabel,
        secondaryHref: content.secondaryCtaHref,
      }
    : {
        ...homepageContent.hero,
        primaryLabel: "Explore Events",
        primaryHref: "/events",
        secondaryLabel: "View Gallery",
        secondaryHref: "/gallery",
      };

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden border-b border-line">
      <div aria-hidden="true" className="architectural-grid absolute inset-0 -z-10 opacity-20" />
      {source ? (
        <Image
          alt={featuredEvent?.coverMedia?.altText ?? ""}
          className="cinematic-media -z-20 object-cover"
          fill
          priority
          sizes="100vw"
          src={source}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_72%_18%,rgba(212,175,55,0.12),transparent_30%),linear-gradient(145deg,#1a1b1f_0%,#0d0e12_55%)]"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-canvas via-canvas/65 to-canvas/15" />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[8vw] -z-10 hidden w-px bg-gradient-to-b from-transparent via-line to-transparent lg:block"
      />

      <Container className="pb-16 pt-28 sm:pb-20 lg:pb-24">
        <div className="max-w-5xl">
          <Badge>{hero.eyebrow}</Badge>
          <h1 className="mt-7 max-w-6xl break-words font-display text-[clamp(3.25rem,12vw,6.5rem)] font-extrabold leading-[0.9] tracking-[-0.06em] text-ink">
            {hero.headline}
            {hero.accent && <span className="block text-gold">{hero.accent}</span>}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
            {hero.description}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link className={buttonClasses("primary", "sm:min-w-44")} href={hero.primaryHref}>
              {hero.primaryLabel}
            </Link>
            {hero.secondaryLabel && hero.secondaryHref && (
              <Link className={buttonClasses("secondary", "sm:min-w-44")} href={hero.secondaryHref}>
                {hero.secondaryLabel}
              </Link>
            )}
          </div>
        </div>

        {featuredEvent && (
          <Link
            className="mt-14 grid min-h-20 max-w-xl gap-2 border-l border-gold py-2 pl-5 transition-[border-color,transform] hover:translate-x-1 hover:border-gold-bright focus-visible:outline-2 focus-visible:outline-offset-4 sm:grid-cols-[auto_1fr] sm:gap-x-5"
            href={`/events/${featuredEvent.slug}`}
          >
            <span className="font-label text-[0.6875rem] uppercase tracking-[0.14em] text-gold">
              Featured
            </span>
            <span className="font-display text-xl font-bold text-ink sm:col-span-2 sm:row-start-2 sm:text-2xl">
              {featuredEvent.title}
            </span>
            <span className="text-sm text-ink-muted sm:col-start-2 sm:row-start-1 sm:text-right">
              {formatEventDate(featuredEvent.startAtUtc, featuredEvent.timeZoneId)} ·{" "}
              {featuredEvent.city}
            </span>
          </Link>
        )}
      </Container>
    </section>
  );
}
