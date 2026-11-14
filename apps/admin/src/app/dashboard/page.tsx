import { UserRole } from "@the-domain/types";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";

const tasks = [
  {
    label: "Events",
    description: "Schedule a show or publish a draft.",
    href: "/dashboard/events",
    role: UserRole.Admin,
  },
  {
    label: "Media library",
    description: "Prepare artwork, photos and video.",
    href: "/dashboard/media",
    role: UserRole.MediaManager,
  },
  {
    label: "Gallery",
    description: "Curate the collections visitors see.",
    href: "/dashboard/gallery",
    role: UserRole.MediaManager,
  },
  {
    label: "Homepage",
    description: "Set the hero media and gallery preview.",
    href: "/dashboard/homepage",
    role: UserRole.Admin,
  },
  {
    label: "Contact messages",
    description: "Read enquiries from the public website.",
    href: "/dashboard/messages",
    role: UserRole.Admin,
  },
  {
    label: "Users and roles",
    description: "Manage staff access.",
    href: "/dashboard/users",
    role: UserRole.SuperAdmin,
  },
];

export default async function DashboardPage() {
  const user = await requireAdminSession();
  const available = tasks.filter((task) => user.role >= task.role);
  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b border-line pb-9">
        <h1 className="font-display text-4xl font-bold sm:text-6xl">Operations</h1>
        <p className="mt-4 text-lg text-ink-muted">Signed in as {user.fullName}.</p>
      </header>
      {available.length > 0 ? (
        <ul className="mt-9 grid gap-px border border-line bg-line sm:grid-cols-2">
          {available.map((task) => (
            <li key={task.href}>
              <Link
                className="group block h-full bg-surface p-6 transition hover:bg-surface-raised sm:p-8"
                href={task.href}
              >
                <h2 className="flex items-center justify-between gap-4 text-xl font-semibold group-hover:text-gold">
                  {task.label}
                  <span aria-hidden="true">↗</span>
                </h2>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{task.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-ink-muted">Your account has no assigned content workflows.</p>
      )}
    </div>
  );
}
