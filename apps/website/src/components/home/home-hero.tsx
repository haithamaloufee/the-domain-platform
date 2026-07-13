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
    <section className="relative isolate flex min-h-[calc(100svh-5rem)] items-end overflow-hidden border-b border-line">
      {source ? (
        <Image
          alt={featuredEvent?.coverMedia?.altText ?? ""}
          className="-z-20 object-cover"
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
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-canvas via-canvas/70 to-canvas/20" />

      <Container className="pb-16 pt-28 sm:pb-20 lg:pb-24">
        <div className="max-w-5xl">
          <Badge>{hero.eyebrow}</Badge>
          <h1 className="mt-7 font-display text-5xl font-extrabold leading-[0.92] tracking-[-0.055em] text-ink sm:text-7xl lg:text-[6.5rem]">
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
            className="mt-14 grid max-w-xl gap-2 border-l border-gold pl-5 transition hover:border-gold-bright sm:grid-cols-[auto_1fr] sm:gap-x-5"
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
