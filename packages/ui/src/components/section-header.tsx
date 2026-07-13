import { cn } from "@the-domain/utils";

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, className }: SectionHeaderProps) {
  return (
    <header className={cn("max-w-3xl", className)}>
      {eyebrow && (
        <p className="mb-4 font-label text-xs font-semibold uppercase tracking-[0.16em] text-gold">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl font-bold tracking-[-0.03em] text-ink sm:text-6xl">
        {title}
      </h1>
      {description && (
        <p className="mt-6 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
          {description}
        </p>
      )}
    </header>
  );
}
