import { UserRole } from "@the-domain/types";
import { EmptyState, SectionHeader } from "@the-domain/ui";
import { UserDirectory } from "@/components/operations/user-directory";
import { requireAdminSession } from "@/lib/auth/session";

export default async function UsersPage() {
  const user = await requireAdminSession();
  return (
    <div className="grid max-w-6xl gap-8">
      <SectionHeader
        title="Users and roles"
        description="Manage staff accounts and dashboard permissions."
      />
      {user.role === UserRole.SuperAdmin ? (
        <UserDirectory currentUserId={user.id} />
      ) : (
        <EmptyState
          title="Access restricted"
          description="Only a super administrator can manage staff access."
        />
      )}
    </div>
  );
}
