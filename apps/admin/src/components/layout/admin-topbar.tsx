import type { AdminUser, UserRoleValue } from "@the-domain/types";
import { LogoutButton } from "@/components/auth/logout-button";

const roleLabels: Record<UserRoleValue, string> = {
  1: "Editor",
  2: "Media manager",
  3: "Admin",
  4: "Super admin",
};

export function AdminTopbar({ user }: { user: AdminUser }) {
  return (
    <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-line px-gutter py-4">
      <div>
        <p className="font-label text-[0.625rem] uppercase tracking-[0.16em] text-gold">
          Administration
        </p>
        <p className="mt-1 text-sm text-ink-muted">{roleLabels[user.role]}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-ink">{user.fullName}</p>
          <p className="mt-1 text-xs text-ink-muted">{user.email}</p>
        </div>
        <div
          aria-hidden="true"
          className="grid size-10 place-items-center border border-line font-label text-xs text-ink"
        >
          {initials(user.fullName)}
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}

function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
