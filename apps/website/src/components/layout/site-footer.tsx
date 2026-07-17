import { Container } from "@the-domain/ui";
import Link from "next/link";
import type { PublicBrandingSettings } from "@the-domain/types";
import Image from "next/image";

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

export function SiteFooter({ branding }: { branding: PublicBrandingSettings }) {
  return (
    <footer className="relative isolate overflow-hidden border-t border-line bg-canvas">
      <div aria-hidden="true" className="architectural-grid absolute inset-0 -z-10 opacity-35" />
      <Container className="border-b border-line py-12 sm:py-16">
        <p className="max-w-6xl break-words font-display text-[clamp(2.75rem,8vw,7rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-ink/10">
          {branding.siteName}
        </p>
      </Container>
      <Container className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Link
            aria-label={`${branding.siteName} home`}
            className="inline-flex min-h-11 items-center font-display text-2xl font-extrabold tracking-[-0.04em] text-ink focus-visible:outline-2 focus-visible:outline-offset-4"
            href="/"
          >
            {branding.alternateLogo ? (
              <Image
                alt={`${branding.siteName} logo`}
                className="h-14 w-auto object-contain"
                height={56}
                width={220}
                src={branding.alternateLogo.url}
              />
            ) : (
              <>
                {branding.siteName}
                <span className="text-gold">.</span>
              </>
            )}
          </Link>
          <p className="mt-5 max-w-lg text-sm leading-7 text-ink-muted sm:text-base">
            {branding.brandDescription}
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
          <p>
            © {new Date().getFullYear()} {branding.siteName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {branding.publicEmail && (
              <a href={`mailto:${branding.publicEmail}`}>{branding.publicEmail}</a>
            )}
            {branding.publicPhone && <span>{branding.publicPhone}</span>}
            {Object.entries(branding.socialLinks).map(([platform, url]) => (
              <a href={url} key={platform} rel="noreferrer noopener" target="_blank">
                {platform}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
