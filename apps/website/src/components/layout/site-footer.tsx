import { Container } from "@the-domain/ui";
import Link from "next/link";

const footerGroups = [
  {
    label: "Explore",
    links: [
      { href: "/events", label: "Events" },
      { href: "/gallery", label: "Gallery" },
      { href: "/services", label: "Services" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-canvas">
      <Container className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Link
            aria-label="The Domain home"
            className="font-display text-2xl font-extrabold tracking-[-0.04em] text-ink"
            href="/"
          >
            THE DOMAIN<span className="text-gold">.</span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-ink-muted">
            Events, entertainment, and visual stories presented from Jordan through a cinematic
            frame.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-8 lg:col-span-5">
          {footerGroups.map((group) => (
            <div key={group.label}>
              <p className="font-label text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold">
                {group.label}
              </p>
              <ul className="mt-5 space-y-3 text-sm text-ink-muted">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="transition hover:text-ink focus-visible:text-gold"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>
      <Container className="border-t border-line py-6">
        <p className="font-label text-[0.625rem] uppercase tracking-[0.12em] text-ink-muted">
          © {new Date().getFullYear()} The Domain Entertainment Company. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
