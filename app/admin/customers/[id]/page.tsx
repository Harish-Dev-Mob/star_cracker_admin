import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}

export default async function CustomerDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const customerId = params.id;

  const customer = await prisma.user.findUnique({
    where: { id: customerId, role: "CUSTOMER" },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          orderItems: { select: { quantity: true } },
        }
      },
      addresses: true,
    }
  });

  if (!customer) {
    notFound();
  }

  const totalSpent = customer.orders.filter(o => o.status !== "CANCELLED").reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />

        <div className="relative z-10 flex gap-4">
          <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-center">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-xl font-black text-blue-900">{formatPrice(totalSpent)}</p>
          </div>
          <div className="bg-indigo-50 border borde
          r-indigo-200 px-4 py-2 rounded-xl text-center">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Orders</p>
            <p className="text-xl font-black text-indigo-900">{customer.orders.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold font-display text-gray-900">Order History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Order ID</th>
                <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold tracking-wider">Items</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customer.orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50">No orders found.</td>
                </tr>
              ) : (
                customer.orders.map((order) => {
                  const itemCount = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5 font-mono text-xs font-bold text-gray-500 group-hover:text-gray-900">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">#{order.id.slice(-8)}</Link>
                      </td>
                      <td className="px-6 py-5 font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="px-6 py-5 font-bold">{itemCount} items</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm
                          ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700 border border-green-200' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 border border-red-200' :
                              'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-gray-900 text-base">{formatPrice(order.total)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
