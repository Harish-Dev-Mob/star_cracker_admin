import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCreateForm from "./ProductCreateForm";

export default async function AdminProductCreatePage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-slide-up">
      {/* Header section */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10">
          <Link href="/admin/products" className="text-sm font-bold text-[var(--color-primary)] hover:underline mb-2 inline-block">
            ← Back to Products
          </Link>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">Create New Product</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Add a new firecracker or combo pack to your catalog.</p>
        </div>
      </div>

      <ProductCreateForm categories={categories} />
    </div>
  );
}
