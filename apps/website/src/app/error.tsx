"use client";

import { Button, Container, Section } from "@the-domain/ui";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Section className="architectural-grid min-h-[68svh]">
      <Container className="flex min-h-[calc(68svh-10rem)] items-end">
        <div className="max-w-3xl border-l border-gold/60 pl-6 sm:pl-10">
          <p className="font-label text-xs uppercase tracking-[0.22em] text-gold">Intermission</p>
          <h1 className="mt-6 font-display text-5xl leading-[0.92] tracking-tight text-ink sm:text-7xl">
            The experience paused unexpectedly.
          </h1>
          <p className="mt-6 max-w-xl leading-7 text-ink-muted">
            Please retry this page. If the issue continues, return through the main navigation.
          </p>
          <Button className="mt-8" onClick={reset}>
            Try again
          </Button>
        </div>
      </Container>
    </Section>
  );
}
