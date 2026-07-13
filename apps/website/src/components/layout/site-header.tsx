import Link from "next/link";
import { Container } from "@the-domain/ui";

const links = [
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <Container className="flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
        <Link
          aria-label="The Domain home"
          className="font-display text-lg font-extrabold tracking-[-0.03em] text-ink"
          href="/"
        >
          THE DOMAIN<span className="text-gold">.</span>
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-label text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  className="transition hover:text-gold focus-visible:text-gold"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
