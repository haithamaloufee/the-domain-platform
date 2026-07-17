import type { PublicBrandingSettings } from "@the-domain/types";
import { Container } from "@the-domain/ui";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";

const groups = [
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
    <footer className="border-t border-line bg-canvas">
      <Container className="grid gap-10 py-12 sm:py-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Link
            aria-label={`${branding.siteName} home`}
            className="inline-flex min-h-11 items-center"
            href="/"
          >
            <BrandLogo className="h-auto w-[clamp(12rem,22vw,18rem)]" />
          </Link>
          {branding.brandDescription && (
            <p className="mt-4 max-w-md text-sm leading-7 text-ink-muted">
              {branding.brandDescription}
            </p>
          )}
        </div>
        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-8 lg:col-span-5">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-gold">{group.label}</p>
              <ul className="mt-3 space-y-1 text-sm text-ink-muted">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="inline-flex min-h-11 items-center hover:text-ink"
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
      <Container className="border-t border-line py-5">
        <div className="flex flex-col gap-3 text-[0.62rem] uppercase tracking-[0.14em] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {branding.siteName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {branding.publicEmail && (
              <a href={`mailto:${branding.publicEmail}`}>{branding.publicEmail}</a>
            )}
            {branding.publicPhone && (
              <a href={`tel:${branding.publicPhone.replace(/\s/g, "")}`}>{branding.publicPhone}</a>
            )}
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
