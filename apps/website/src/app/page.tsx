import Link from "next/link";
import { Container, Section, Badge, buttonClasses } from "@the-domain/ui";
export default function HomePage() {
  return (
    <Section className="relative isolate min-h-[70vh] overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(212,175,55,0.12),transparent_35%)]"
      />
      <Container>
        <Badge>Amman · Jordan</Badge>
        <h1 className="mt-8 max-w-5xl font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] text-ink sm:text-7xl lg:text-8xl">
          Entertainment,
          <br />
          <span className="text-gold">framed differently.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-ink-muted">
          The frontend foundation for The Domain’s premium event platform—built around cinematic
          content, precise interaction, and editorial space.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link className={buttonClasses()} href="/events">
            Explore events
          </Link>
          <Link className={buttonClasses("secondary")} href="/gallery">
            View gallery
          </Link>
        </div>
      </Container>
    </Section>
  );
}
