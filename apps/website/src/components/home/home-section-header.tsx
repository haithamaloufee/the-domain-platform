import { buttonClasses } from "@the-domain/ui";
import Link from "next/link";

export function HomeSectionHeader({
  actionHref,
  actionLabel,
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
    <header className="grid gap-7 border-b border-line pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)] lg:items-end">
      <div>
        <p className="font-label text-xs font-semibold uppercase tracking-[0.16em] text-gold">
          {eyebrow}
        </p>
        <h2 className="mt-4 max-w-4xl font-display text-4xl font-bold tracking-[-0.04em] text-ink sm:text-6xl">
          {title}
        </h2>
      </div>
      <div className="lg:justify-self-end">
        <p className="max-w-xl text-sm leading-7 text-ink-muted sm:text-base">{description}</p>
        {actionHref && actionLabel && (
          <Link className={buttonClasses("secondary", "mt-5")} href={actionHref}>
            {actionLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
