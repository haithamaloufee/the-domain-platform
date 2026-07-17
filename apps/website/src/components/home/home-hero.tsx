import { MediaType, type PublicEventListItem, type PublicHomepageContent } from "@the-domain/types";
import { Container, buttonClasses } from "@the-domain/ui";
import { eventCoverRenderData } from "@the-domain/utils";
import Image from "next/image";
import Link from "next/link";
import { EventCoverImage } from "@/components/events/event-cover-image";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";
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
    <section className="relative isolate -mt-[var(--site-header-height)] flex min-h-[max(42rem,100svh)] items-end overflow-hidden">
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
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_72%_18%,rgba(212,175,55,.18),transparent_30%),linear-gradient(145deg,#1a1b1f_0%,#0d0e12_55%)]"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(7_8_10/.76)_0%,transparent_27%),linear-gradient(90deg,rgb(7_8_10/.84)_0%,rgb(7_8_10/.34)_48%,rgb(7_8_10/.12)_100%),radial-gradient(ellipse_at_center,transparent_44%,rgb(7_8_10/.38)_100%),linear-gradient(to_top,var(--td-color-canvas)_0%,rgb(13_14_18/.72)_18%,transparent_58%)]"
      />
      <Container className="pb-20 pt-36 sm:pb-24 sm:pt-40 lg:pb-28">
        <div className="max-w-5xl" data-hero-reveal>
          <p className="type-eyebrow text-gold" data-hero-part="eyebrow">
            <DynamicText kind="label">{hero.eyebrow}</DynamicText>
          </p>
          <div className="mt-6 overflow-hidden" data-hero-part="headline-mask">
            <h1 className="max-w-[13ch] break-words text-[clamp(3.35rem,8vw,7.75rem)] font-extrabold leading-[.88] tracking-[-.06em] text-ink">
              <DynamicText kind="heading">{hero.headline}</DynamicText>
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
            <Link className={buttonClasses("primary", "sm:min-w-44")} href={hero.primaryHref}>
              <DynamicText kind="action">{hero.primaryLabel}</DynamicText>
            </Link>
            {hero.secondaryLabel && hero.secondaryHref && (
              <Link className={buttonClasses("secondary", "sm:min-w-44")} href={hero.secondaryHref}>
                <DynamicText kind="action">{hero.secondaryLabel}</DynamicText>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
