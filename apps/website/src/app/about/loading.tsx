import { Container } from "@the-domain/ui";

export default function AboutLoading() {
  return (
    <section
      className="relative min-h-[70svh] overflow-hidden border-b border-line bg-canvas"
      role="status"
    >
      <Container className="flex min-h-[70svh] items-end py-20">
        <div className="max-w-5xl">
          <p className="type-eyebrow text-gold">About The Domain</p>
          <h1 className="mt-5 max-w-[13ch] font-display text-[clamp(3.5rem,11vw,8rem)] font-bold leading-[.9] tracking-[-.06em]">
            We turn ideas into experiences
          </h1>
          <span className="sr-only">Loading About presentation</span>
        </div>
      </Container>
    </section>
  );
}
