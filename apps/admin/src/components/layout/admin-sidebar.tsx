import Link from "next/link";

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
                className="block border-l border-transparent px-3 py-2.5 font-label text-xs uppercase tracking-[0.1em] text-ink-muted transition hover:border-gold hover:bg-surface-raised hover:text-ink"
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
