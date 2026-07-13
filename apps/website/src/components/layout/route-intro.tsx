import Link from "next/link";
import { Container, Section, buttonClasses } from "@the-domain/ui";

export interface RouteIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  note?: string;
}

export function RouteIntro({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  note = "The Domain · Amman, Jordan",
}: RouteIntroProps) {
  return (
    <Section className="architectural-grid relative isolate min-h-[72svh] overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="absolute -right-32 top-10 -z-10 size-96 rounded-full bg-gold/10 blur-3xl"
      />
      <Container className="grid min-h-[calc(72svh-10rem)] content-between gap-16 lg:grid-cols-12 lg:items-end">
        <div className="cinematic-reveal max-w-4xl lg:col-span-9">
          <p className="font-label text-xs uppercase tracking-[0.24em] text-gold">{eyebrow}</p>
          <h1 className="mt-7 max-w-[14ch] break-words font-display text-[clamp(3.7rem,10vw,9rem)] leading-[0.84] tracking-[-0.055em] text-ink">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-8 text-ink-muted sm:text-lg">
            {description}
          </p>
          {actionHref && actionLabel ? (
            <Link className={`${buttonClasses()} mt-9`} href={actionHref}>
              {actionLabel}
            </Link>
          ) : null}
        </div>
        <p className="border-l border-gold/50 pl-4 font-label text-[0.7rem] uppercase leading-6 tracking-[0.16em] text-ink-subtle lg:col-span-3">
          {note}
        </p>
      </Container>
    </Section>
  );
}
