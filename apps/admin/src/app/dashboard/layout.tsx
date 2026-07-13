import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { requireAdminSession } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminSession();

  return (
    <div className="min-h-screen lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminTopbar user={user} />
        <main className="px-gutter py-10" id="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
