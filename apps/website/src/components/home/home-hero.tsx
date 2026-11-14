import { MediaType, type HomepagePresentation, type PublicEventListItem } from "@the-domain/types";
import { Container, buttonClasses } from "@the-domain/ui";
import { eventCoverRenderData } from "@the-domain/utils";
import Image from "next/image";
import Link from "next/link";
import { EventCoverImage } from "@/components/events/event-cover-image";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";
import { homeContent } from "@/content/home";
import { HeroBackgroundVideo } from "./hero-background-video";
import { formatEventDate } from "@/components/events/event-presentation";

export function HomeHero({
  presentation,
  featuredEvent,
}: {
  presentation: HomepagePresentation | null;
  featuredEvent: PublicEventListItem | null;
}) {
  const source = eventCoverRenderData(featuredEvent?.coverMedia ?? null);
  const configuredMedia = presentation?.heroMedia ?? null;
  const hero = homeContent.hero;

  return (
    <section className="domain-hero relative isolate -mt-[var(--site-header-height)] flex items-end overflow-hidden border-b border-line">
      {configuredMedia?.mediaType === MediaType.Video ? (
        <HeroBackgroundVideo
          poster={configuredMedia.posterUrl ?? undefined}
          src={configuredMedia.url}
        />
      ) : configuredMedia?.mediaType === MediaType.Image ? (
        <Image
          alt=""
          aria-hidden="true"
          className="-z-20 object-cover"
          fill
          priority
          sizes="100vw"
          src={configuredMedia.url}
        />
      ) : source ? (
        <EventCoverImage
          className="-z-20 object-cover"
          media={featuredEvent!.coverMedia!}
          priority
          sizes="100vw"
        />
      ) : (
        <div aria-hidden="true" className="domain-hero-light absolute inset-0 -z-20" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(7_8_10/.76)_0%,transparent_27%),linear-gradient(90deg,rgb(7_8_10/.84)_0%,rgb(7_8_10/.34)_48%,rgb(7_8_10/.12)_100%),radial-gradient(ellipse_at_center,transparent_44%,rgb(7_8_10/.38)_100%),linear-gradient(to_top,var(--td-color-canvas)_0%,rgb(13_14_18/.72)_18%,transparent_58%)]"
      />
      <Container className="grid items-end gap-12 pb-12 pt-32 sm:pb-20 sm:pt-40 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.3fr)] lg:gap-12">
        <div data-hero-reveal>
          <p className="type-eyebrow text-gold" data-hero-part="eyebrow">
            <DynamicText kind="label">{hero.eyebrow}</DynamicText>
          </p>
          <div className="mt-6 overflow-hidden" data-hero-part="headline-mask">
            <h1 className="domain-hero-title text-ink">
              <DynamicText kind="heading">{hero.title}</DynamicText>
              {hero.accent && (
                <span className="block text-gold">
                  <DynamicText kind="heading">{hero.accent}</DynamicText>
                </span>
              )}
            </h1>
          </div>
          <p
            className="mt-7 max-w-xl text-[clamp(1rem,1.4vw,1.3rem)] leading-8 text-ink/76"
            data-hero-part="copy"
          >
            <DynamicText>{hero.description}</DynamicText>
          </p>
          <div className="mt-8 flex flex-wrap gap-3" data-hero-part="actions">
            <Link className={buttonClasses("primary", "sm:min-w-44")} href={hero.primaryCta.href}>
              <DynamicText kind="action">{hero.primaryCta.label}</DynamicText>
            </Link>
            <Link
              className={buttonClasses("secondary", "sm:min-w-44")}
              href={hero.secondaryCta.href}
            >
              <DynamicText kind="action">{hero.secondaryCta.label}</DynamicText>
            </Link>
          </div>
        </div>
        {featuredEvent && (
          <Link
            className="group grid max-w-sm gap-2 border-t border-gold/55 bg-canvas/65 px-4 py-4 transition hover:bg-canvas sm:px-5 sm:py-5"
            href={`/events/${encodeURIComponent(featuredEvent.slug)}`}
          >
            <span className="font-label text-xs uppercase tracking-widest text-gold">
              On the programme
            </span>
            <span className="flex items-baseline justify-between gap-3 text-lg font-semibold text-ink">
              {featuredEvent.title}
              <span
                aria-hidden="true"
                className="text-gold transition-transform group-hover:translate-x-1"
              >
                ↗
              </span>
            </span>
            <time className="text-sm text-ink-muted" dateTime={featuredEvent.startAtUtc}>
              {formatEventDate(featuredEvent.startAtUtc, featuredEvent.timeZoneId)}
            </time>
          </Link>
        )}
      </Container>
    </section>
  );
}
