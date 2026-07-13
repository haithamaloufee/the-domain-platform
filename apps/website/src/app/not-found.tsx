import Link from "next/link";
import type { Metadata } from "next";
import { Container, Section, buttonClasses } from "@the-domain/ui";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Page Not Found",
  description: "The requested page is not available on The Domain website.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <Section className="architectural-grid min-h-[68svh]">
      <Container className="grid min-h-[calc(68svh-10rem)] content-end gap-8 lg:grid-cols-12 lg:items-end">
        <p className="font-display text-[clamp(6rem,20vw,15rem)] leading-[0.68] text-gold/20 lg:col-span-5">
          404
        </p>
        <div className="border-l border-gold/60 pl-6 lg:col-span-7 lg:pl-10">
          <p className="font-label text-xs uppercase tracking-[0.22em] text-gold">
            Outside the frame
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[0.92] tracking-tight text-ink sm:text-7xl">
            This page is no longer in view.
          </h1>
          <p className="mt-6 max-w-xl leading-7 text-ink-muted">
            The address may have changed or the content is no longer publicly available.
          </p>
          <Link className={`${buttonClasses()} mt-8`} href="/">
            Return home
          </Link>
        </div>
      </Container>
    </Section>
  );
}
