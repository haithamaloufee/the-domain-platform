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
    <footer className="relative isolate overflow-hidden border-t border-line bg-canvas">
      <div aria-hidden="true" className="architectural-grid absolute inset-0 -z-10 opacity-35" />
      <Container className="border-b border-line py-12 sm:py-16">
        <p className="max-w-6xl font-display text-[clamp(3.5rem,12vw,10rem)] font-extrabold leading-[0.78] tracking-[-0.075em] text-ink/10">
          THE DOMAIN
        </p>
      </Container>
      <Container className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Link
            aria-label="The Domain home"
            className="inline-flex min-h-11 items-center font-display text-2xl font-extrabold tracking-[-0.04em] text-ink focus-visible:outline-2 focus-visible:outline-offset-4"
            href="/"
          >
            THE DOMAIN<span className="text-gold">.</span>
          </Link>
          <p className="mt-5 max-w-lg text-sm leading-7 text-ink-muted sm:text-base">
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
              <ul className="mt-5 space-y-2 text-sm text-ink-muted">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="inline-flex min-h-11 items-center transition hover:text-ink focus-visible:text-gold"
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
        <div className="flex flex-col gap-3 font-label text-[0.625rem] uppercase tracking-[0.14em] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} The Domain Entertainment Company. All rights reserved.</p>
          <p>Amman · Jordan</p>
        </div>
      </Container>
    </footer>
  );
}
