"use client";

import type { PublicBrandingSettings } from "@the-domain/types";
import { Container } from "@the-domain/ui";
import { cn } from "@the-domain/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DynamicText } from "@/components/motion/dynamic-weight-controller";
import { BrandLogo } from "./brand-logo";

const links = [
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader({ branding }: { branding: PublicBrandingSettings }) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 28);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])") ?? [],
      );
    focusable()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const pointerdown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", keydown);
    document.addEventListener("pointerdown", pointerdown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("pointerdown", pointerdown);
    };
  }, [menuOpen]);

  const overlay = pathname === "/" && !compact && !menuOpen;
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-12 after:content-['']",
        overlay
          ? "bg-[linear-gradient(to_bottom,rgb(0_0_0/.96),rgb(0_0_0/.72))] after:bg-gradient-to-b after:from-black/70 after:to-transparent"
          : "bg-black/92 backdrop-blur-xl after:bg-gradient-to-b after:from-black/35 after:to-transparent",
      )}
      data-site-header
      ref={rootRef}
    >
      <Container
        className={cn(
          "flex items-center justify-between gap-5 transition-[min-height]",
          compact || menuOpen ? "min-h-16" : "min-h-20",
        )}
      >
        <Link
          aria-label={`${branding.siteName} home`}
          className="inline-flex min-h-11 items-center"
          href="/"
        >
          <BrandLogo className="h-auto w-[clamp(10.5rem,17vw,15.5rem)]" priority />
        </Link>
        <nav aria-label="Primary navigation" className="hidden md:block">
          <ul className="flex items-center gap-x-[clamp(1.8rem,3vw,4rem)] text-[clamp(1.05rem,1.12vw,1.35rem)] tracking-[-.015em]">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className="relative inline-flex min-h-11 items-center"
                  data-site-nav-link
                  href={link.href}
                >
                  <DynamicText kind="action">{link.label}</DynamicText>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="grid size-11 place-items-center border border-ink/25 text-ink transition-colors hover:border-gold hover:text-gold md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          ref={toggleRef}
          type="button"
        >
          <span aria-hidden="true" className="relative block h-4 w-5">
            <span
              className={cn(
                "absolute left-0 top-0 h-px w-5 bg-current transition-transform",
                menuOpen && "translate-y-[.45rem] rotate-45",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-[.45rem] h-px w-5 bg-current transition-opacity",
                menuOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "absolute bottom-0 left-0 h-px w-5 bg-current transition-transform",
                menuOpen && "-translate-y-[.45rem] -rotate-45",
              )}
            />
          </span>
        </button>
      </Container>
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "fixed inset-x-0 top-16 z-[70] h-[calc(100dvh-4rem)] overflow-y-auto bg-canvas/98 px-gutter py-7 backdrop-blur-2xl transition-[opacity,transform] md:hidden",
          menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0",
        )}
        id="mobile-navigation"
        inert={!menuOpen}
        ref={menuRef}
      >
        <ul className="divide-y divide-line border-y border-line">
          {links.map((link, index) => (
            <li key={link.href}>
              <Link
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className="flex min-h-16 items-center justify-between text-2xl"
                data-site-nav-link
                href={link.href}
                onClick={() => setMenuOpen(false)}
              >
                <DynamicText kind="action">{link.label}</DynamicText>
                <span className="text-[0.65rem] font-normal tracking-[0.16em] text-ink-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
