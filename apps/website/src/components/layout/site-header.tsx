"use client";

import { Container } from "@the-domain/ui";
import { cn } from "@the-domain/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 36);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-2xl transition-[background-color,border-color] duration-300",
        compact && "border-line/80 bg-canvas/95",
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between gap-4 transition-[min-height] duration-300",
          compact ? "min-h-16" : "min-h-20",
        )}
      >
        <Link
          aria-label="The Domain home"
          className="inline-flex min-h-11 items-center font-display text-lg font-extrabold tracking-[-0.03em] text-ink focus-visible:outline-2 focus-visible:outline-offset-4"
          href="/"
        >
          THE DOMAIN<span className="text-gold">.</span>
        </Link>
        <nav aria-label="Primary navigation" className="hidden md:block">
          <ul className="flex items-center gap-x-7 font-label text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={cn(
                    "relative inline-flex min-h-11 items-center transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-gold after:transition-transform",
                    isActive(pathname, link.href)
                      ? "text-ink after:scale-x-100"
                      : "after:scale-x-0 hover:text-gold hover:after:scale-x-100 focus-visible:text-gold",
                  )}
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="grid size-11 place-items-center border border-line text-ink transition hover:border-gold hover:text-gold md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          type="button"
        >
          <span aria-hidden="true" className="relative block h-4 w-5">
            <span
              className={cn(
                "absolute left-0 top-0 h-px w-5 bg-current transition-transform",
                menuOpen && "translate-y-[0.45rem] rotate-45",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-[0.45rem] h-px w-5 bg-current transition-opacity",
                menuOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute bottom-0 left-0 h-px w-5 bg-current transition-transform",
                menuOpen && "-translate-y-[0.45rem] -rotate-45",
              )}
            />
          </span>
        </button>
      </Container>
      <nav
        aria-hidden={!menuOpen}
        aria-label="Mobile navigation"
        className={cn(
          "absolute inset-x-0 top-full overflow-hidden border-b border-line bg-canvas/98 backdrop-blur-2xl transition-[max-height,opacity] duration-300 md:hidden",
          menuOpen ? "max-h-[28rem] opacity-100" : "pointer-events-none max-h-0 opacity-0",
        )}
        id="mobile-navigation"
        inert={!menuOpen}
      >
        <Container className="py-5">
          <ul className="divide-y divide-line border-y border-line">
            {links.map((link, index) => (
              <li key={link.href}>
                <Link
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 items-center justify-between font-display text-xl font-bold tracking-[-0.02em] transition-colors",
                    isActive(pathname, link.href) ? "text-gold" : "text-ink hover:text-gold",
                  )}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  <span className="font-label text-[0.625rem] font-normal tracking-[0.14em] text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </header>
  );
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
