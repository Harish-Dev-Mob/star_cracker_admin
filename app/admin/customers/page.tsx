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

  const [totalCount, activeCount, customers] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", isBlocked: false } }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const inactiveCount = totalCount - activeCount;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 font-display tracking-tight">
            Customers Management
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            View and manage your registered users.{" "}
            <span className="text-blue-600 font-bold">
              {totalCount.toLocaleString()} customers total
            </span>
          </p>
        </div>

        {/* Stats pills */}
        <div className="relative z-10 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                Active
              </p>
              <p className="text-lg font-black text-green-800 leading-none">
                {activeCount.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                Blocked
              </p>
              <p className="text-lg font-black text-red-800 leading-none">
                {inactiveCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">
                  Customer Details
                </th>
                <th className="px-6 py-4 font-bold tracking-wider hidden sm:table-cell">
                  Phone
                </th>
                <th className="px-6 py-4 font-bold tracking-wider hidden md:table-cell">
                  Joined Date
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-center hidden sm:table-cell">
                  Orders
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  Status
                </th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50"
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => {
                  const isActive = !customer.isBlocked;
                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Customer Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 text-gray-700 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shadow-inner group-hover:scale-110 transition-transform shrink-0">
                            {customer.name?.charAt(0).toUpperCase() ?? "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">
                              {customer.name}
                            </p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5 truncate">
                              {customer.email || "No email"}
                            </p>
                            {/* Show phone & joined on mobile */}
                            <p className="text-xs text-gray-400 mt-0.5 sm:hidden">
                              {customer.phone || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 font-medium text-gray-700 hidden sm:table-cell">
                        {customer.phone || "—"}
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap hidden md:table-cell">
                        {new Date(customer.createdAt).toLocaleDateString(
                          "en-IN",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </td>

                      {/* Orders */}
                      <td className="px-6 py-4 text-center hidden sm:table-cell">
                        <span className="font-black text-gray-900 text-base bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">
                          {customer._count.orders}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${
                            isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {isActive ? "Active" : "Blocked"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        <AdminLinkBtn
                          href={`/admin/customers/${customer.id}`}
                          variant="view"
                        >
                          View
                        </AdminLinkBtn>
                      </td>
                    </tr>
                  );
                })
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
            {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, totalCount)}
          </span>{" "}
          of{" "}
          <span className="text-gray-600 font-bold">
            {totalCount.toLocaleString()}
          </span>{" "}
          customers &nbsp;·&nbsp; Page {safePage} of {totalPages}
        </p>
      )}
    </div>
  );
}
