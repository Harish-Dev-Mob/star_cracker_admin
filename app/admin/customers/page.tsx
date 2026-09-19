import { prisma } from "@/lib/prisma";
import { AdminLinkBtn, PaginationBar } from "@/components/admin/AdminActions";

const PAGE_SIZE = 15;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [totalCount, customers] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">Customers Management</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            View and manage your registered users.{" "}
            <span className="text-blue-600 font-bold">{totalCount.toLocaleString()} customers total</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Customer Details</th>
                <th className="px-6 py-4 font-bold tracking-wider">Phone</th>
                <th className="px-6 py-4 font-bold tracking-wider">Joined Date</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Total Orders</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 text-gray-700 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform shrink-0">
                        {customer.name?.charAt(0).toUpperCase() ?? "U"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{customer.email || "No email"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{customer.phone || "—"}</td>
                    <td className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap">
                      {new Date(customer.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-black text-gray-900 text-base bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">
                        {customer._count.orders}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <AdminLinkBtn href={`/admin/customers/${customer.id}`} variant="view">
                        View
                      </AdminLinkBtn>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar currentPage={safePage} totalPages={totalPages} />
      </div>

      {totalPages > 1 && (
        <p className="text-center text-xs text-gray-400 font-medium -mt-4">
          Showing{" "}
          <span className="text-gray-600 font-bold">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, totalCount)}
          </span>{" "}
          of <span className="text-gray-600 font-bold">{totalCount.toLocaleString()}</span> customers
          &nbsp;·&nbsp; Page {safePage} of {totalPages}
        </p>
      )}
    </div>
  );
}
