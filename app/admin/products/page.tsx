import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { AdminLinkBtn, PaginationBar } from "@/components/admin/AdminActions";

const ALLOWED_SIZES = [10, 20, 50, 100] as const;
type PageSize = (typeof ALLOWED_SIZES)[number];

function parsePageSize(raw: string | undefined): PageSize {
  const n = parseInt(raw ?? "20", 10);
  return (ALLOWED_SIZES as readonly number[]).includes(n) ? (n as PageSize) : 20;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { page: pageParam, pageSize: pageSizeParam } = await searchParams;
  const pageSize = parsePageSize(pageSizeParam);
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [totalCount, products] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-100 to-orange-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">Products Management</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Manage your catalog, inventory, and pricing.{" "}
            <span className="text-amber-600 font-bold">{totalCount.toLocaleString()} products total</span>
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3">
          <Link href="/admin/products/bulk-upload" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all uppercase tracking-wider flex items-center gap-2">
            <span className="text-lg">📁</span> Bulk Upload
          </Link>
          <Link href="/admin/products/new" className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] hover:-translate-y-0.5 transition-all uppercase tracking-wider flex items-center gap-2">
             <span className="text-lg">+</span> Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider w-20">Image</th>
                <th className="px-6 py-4 font-bold tracking-wider">Product Name</th>
                <th className="px-6 py-4 font-bold tracking-wider">Category</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Price</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Stock</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50">No products found.</td>
                </tr>
              ) : (
                products.map((product) => {
                  const img = (() => {
                     try { return (JSON.parse(product.images) as string[])[0] || "/images/products/placeholder.jpg"; }
                     catch { return "/images/products/placeholder.jpg"; }
                  })();

                  return (
                     <tr key={product.id} className="hover:bg-amber-50/30 transition-colors group cursor-pointer">
                       <td className="px-6 py-4">
                          <div className="relative h-12 w-12 rounded-xl border border-gray-200 overflow-hidden bg-gray-100 group-hover:shadow-md transition-shadow">
                             <Image src={img} alt="" fill className="object-cover" />
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 font-medium">{product.slug}</span>
                            {product.crackerType === "GREEN" && (
                              <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider">GREEN</span>
                            )}
                          </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-600">
                          {product.category?.name ?? "—"}
                       </td>
                       <td className="px-6 py-4 text-right">
                          {product.discountPrice ? (
                             <>
                               <div className="font-black text-gray-900 text-base">{formatPrice(product.discountPrice)}</div>
                               <div className="text-xs text-gray-400 line-through font-semibold">{formatPrice(product.price)}</div>
                             </>
                          ) : (
                             <div className="font-black text-gray-900 text-base">{formatPrice(product.price)}</div>
                          )}
                       </td>
                       <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className={`font-black text-base ${product.stock <= 0 ? 'text-red-600' : product.stock <= product.lowStockThreshold ? 'text-amber-500' : 'text-gray-900'}`}>
                               {product.stock}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">
                              Min {product.lowStockThreshold}
                            </span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${product.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-center">
                           <AdminLinkBtn href={`/admin/products/${product.id}`} variant="edit">
                             Edit
                           </AdminLinkBtn>
                        </td>
                     </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationBar currentPage={safeCurrentPage} totalPages={totalPages} pageSize={pageSize} />
      </div>

      {/* Page info */}
      {totalPages > 1 && (
        <p className="text-center text-xs text-gray-400 font-medium -mt-4">
          Showing{" "}
          <span className="text-gray-600 font-bold">
            {(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, totalCount)}
          </span>{" "}
          of <span className="text-gray-600 font-bold">{totalCount.toLocaleString()}</span> products
          &nbsp;·&nbsp; Page {safeCurrentPage} of {totalPages}
        </p>
      )}
    </div>
  );
}
