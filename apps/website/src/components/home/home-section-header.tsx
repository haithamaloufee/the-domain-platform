export function HomeSectionHeader({
  description,
  eyebrow,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="mx-auto max-w-5xl text-center">
      <p className="type-eyebrow text-gold">{eyebrow}</p>
      <h2 className="mt-4 text-[clamp(2.6rem,6vw,6rem)] font-extrabold leading-[.95] tracking-[-.055em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
        {description}
      </p>
    </header>
  );
}
