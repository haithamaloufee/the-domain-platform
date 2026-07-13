import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminTopbar />
        <main className="px-gutter py-10" id="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
