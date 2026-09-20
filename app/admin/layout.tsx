import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div
      className="flex h-screen bg-[#F8FAFC] [color-scheme:light] text-gray-900"
      style={{
        ["--color-border" as string]: "#E8D5C4",
        ["--color-border-focus" as string]: "#B91C1C",
        ["--color-bg" as string]: "#FFF8F0",
        ["--color-bg-card" as string]: "#FFFFFF",
        ["--color-text" as string]: "#1A1A1A",
        ["--color-text-muted" as string]: "#6B6B6B",
      }}
    >
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Spacer for fixed mobile header */}
        <div className="lg:hidden h-16 shrink-0" />

        {/* ── Breadcrumb bar ──────────────────────────────── */}
        <div className="shrink-0 px-4 lg:px-8 py-3 bg-white border-b border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <AdminBreadcrumb />
        </div>

        {/* ── Page content ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
