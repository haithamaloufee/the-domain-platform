"use client";

import { cn } from "@the-domain/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/events", label: "Events" },
  { href: "/dashboard/media", label: "Media" },
  { href: "/dashboard/gallery", label: "Gallery" },
  { href: "/dashboard/homepage", label: "Homepage" },
  { href: "/dashboard/partners", label: "Partners" },
  { href: "/dashboard/statistics", label: "Statistics" },
  { href: "/dashboard/discounts", label: "Discounts" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/users", label: "Users & roles" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-surface lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="border-b border-line px-6 py-6 font-display text-lg font-extrabold">
        THE DOMAIN<span className="text-gold">.</span>
        <span className="mt-1 block font-label text-[0.625rem] uppercase tracking-[0.16em] text-ink-muted">
          Operations
        </span>
      </div>
      <nav aria-label="Admin navigation" className="overflow-x-auto p-3 lg:overflow-visible">
        <ul className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "block border-l px-3 py-2.5 font-label text-xs uppercase tracking-[0.1em] transition",
                  isActive(pathname, item.href)
                    ? "border-gold bg-surface-raised text-gold"
                    : "border-transparent text-ink-muted hover:border-gold hover:bg-surface-raised hover:text-ink",
                )}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function isActive(pathname: string, href: string): boolean {
  return href === "/dashboard"
    ? pathname === href
    : pathname.startsWith(`${href}/`) || pathname === href;
}
