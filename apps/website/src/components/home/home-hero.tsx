import { MediaType, type PublicEventListItem, type PublicHomepageContent } from "@the-domain/types";
import { Badge, Container, buttonClasses } from "@the-domain/ui";
import { eventCoverRenderData } from "@the-domain/utils";
import Link from "next/link";
import Image from "next/image";
import { EventCoverImage } from "@/components/events/event-cover-image";
import { formatEventDate } from "@/components/events/event-presentation";
import { homepageContent } from "@/content/homepage-content";
import { HeroBackgroundVideo } from "./hero-background-video";

export function HomeHero({
  content,
  featuredEvent,
}: {
  content: PublicHomepageContent | null;
  featuredEvent: PublicEventListItem | null;
}) {
  const source = eventCoverRenderData(featuredEvent?.coverMedia ?? null);
  const configuredMedia = content?.builder.heroMedia ?? null;
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
    <section className="relative isolate mx-gutter mt-3 flex min-h-[clamp(36rem,76svh,48rem)] items-end overflow-hidden rounded-[var(--td-radius-md)] border border-line/70 sm:mt-5">
      <div aria-hidden="true" className="architectural-grid absolute inset-0 -z-10 opacity-20" />
      {configuredMedia?.mediaType === MediaType.Video ? (
        <HeroBackgroundVideo
          poster={configuredMedia.posterUrl ?? undefined}
          src={configuredMedia.url}
        />
      ) : configuredMedia?.mediaType === MediaType.Image ? (
        <Image
          alt=""
          aria-hidden="true"
          className="cinematic-media -z-20 object-cover"
          fill
          priority
          sizes="100vw"
          src={configuredMedia.url}
        />
      ) : source ? (
        <EventCoverImage
          className="cinematic-media -z-20 object-cover"
          media={featuredEvent!.coverMedia!}
          priority
          sizes="100vw"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_72%_18%,rgba(212,175,55,0.12),transparent_30%),linear-gradient(145deg,#1a1b1f_0%,#0d0e12_55%)]"
        />
      )}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(13_14_18/92%)_0%,rgb(13_14_18/48%)_52%,rgb(13_14_18/12%)_100%)]" />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-[8vw] -z-10 hidden w-px bg-gradient-to-b from-transparent via-line to-transparent lg:block"
      />

      <Container className="pb-12 pt-24 sm:pb-14 sm:pt-28 lg:pb-16">
        <div className="max-w-4xl">
          <Badge>{hero.eyebrow}</Badge>
          <h1 className="type-display mt-6 break-words text-ink">
            {hero.headline}
            {hero.accent && <span className="block text-gold">{hero.accent}</span>}
          </h1>
          <p className="type-body-lead mt-5 max-w-xl text-ink-muted">{hero.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
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
            className="mt-10 grid min-h-20 max-w-xl gap-2 border-l border-gold py-2 pl-5 transition-[border-color,transform] hover:translate-x-1 hover:border-gold-bright sm:grid-cols-[auto_1fr] sm:gap-x-5"
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
