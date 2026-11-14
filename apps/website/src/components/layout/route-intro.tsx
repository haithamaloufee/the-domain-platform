import Link from "next/link";
import { Container, Section, buttonClasses } from "@the-domain/ui";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";

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
          <p className="font-label text-xs uppercase tracking-[0.24em] text-gold">
            <DynamicText kind="label">{eyebrow}</DynamicText>
          </p>
          <h1 className="type-page-heading mt-7 break-words text-ink">
            <DynamicText kind="heading">{title}</DynamicText>
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-8 text-ink-muted sm:text-lg">
            <DynamicText>{description}</DynamicText>
          </p>
          {actionHref && actionLabel ? (
            <Link className={`${buttonClasses()} mt-9`} href={actionHref}>
              <DynamicText kind="action">{actionLabel}</DynamicText>
            </Link>
          ) : null}
        </div>
        <p className="border-l border-gold/50 pl-4 font-label text-[0.7rem] uppercase leading-6 tracking-[0.16em] text-ink-subtle lg:col-span-3">
          <DynamicText kind="label">{note}</DynamicText>
        </p>
      </Container>
    </Section>
  );
}
