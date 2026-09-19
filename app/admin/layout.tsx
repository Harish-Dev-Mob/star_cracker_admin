import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-4 shrink-0">
          <span className="font-display font-bold text-[var(--color-primary)]">Admin Panel</span>
          <Link href="/" className="text-sm font-medium text-gray-600">Store →</Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
