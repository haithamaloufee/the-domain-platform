import { DynamicText } from "@/components/motion/dynamic-weight-controller";

export function HomeSectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mx-auto max-w-6xl text-center" data-reveal="heading">
      <p className="type-eyebrow text-gold" data-reveal="label">
        <DynamicText kind="label">{eyebrow}</DynamicText>
      </p>
      <h2 className="mt-4 text-[clamp(2.6rem,6vw,6rem)] font-extrabold leading-[.92] tracking-[-.055em] text-ink">
        <DynamicText kind="heading">{title}</DynamicText>
      </h2>
    </header>
  );
}
