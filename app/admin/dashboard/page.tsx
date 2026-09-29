import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { GroupedOrderRow } from "@/components/admin/GroupedOrderRow";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n);
}

export default async function AdminDashboard() {
  const [
    totalRevenueData,
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } }
    }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { 
        user: { select: { name: true, email: true, phone: true } },
        orderItems: { select: { quantity: true } }
      }
    })
  ]);

  // Group recent orders by customer
  const groupedOrdersObj = recentOrders.reduce((acc, order) => {
    if (!acc[order.userId]) {
      acc[order.userId] = {
        userId: order.userId,
        user: order.user,
        latestOrderDate: order.createdAt,
        totalSpent: 0,
        totalItems: 0,
        orders: [],
      };
    }
    acc[order.userId].orders.push(order);
    acc[order.userId].totalSpent += order.total;
    acc[order.userId].totalItems += order.orderItems.reduce((s, i) => s + i.quantity, 0);
    return acc;
  }, {} as Record<string, any>);

  const groupedRecentOrders = Object.values(groupedOrdersObj)
    .sort((a: any, b: any) => new Date(b.latestOrderDate).getTime() - new Date(a.latestOrderDate).getTime())
    .slice(0, 5); // Take top 5 recent customer groups

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenueData._sum.total || 0), icon: "💰", color: "bg-green-100 text-green-700" },
    { label: "Total Orders", value: totalOrders, icon: "📦", color: "bg-blue-100 text-blue-700" },
    { label: "Total Products", value: totalProducts, icon: "🎆", color: "bg-amber-100 text-amber-700" },
    { label: "Total Customers", value: totalCustomers, icon: "👥", color: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100 to-red-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 font-display tracking-tight">Dashboard Overview</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold flex items-center gap-2 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Status
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(220,38,38,0.08)] hover:border-orange-100 transition-all duration-300 hover:-translate-y-1 flex items-center gap-5 group"
          >
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 font-display">Recent Orders</h2>
          <Link 
            href="/admin/orders" 
            className="text-sm text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Orders</th>
                <th className="px-6 py-4 font-bold tracking-wider">Customer</th>
                <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold tracking-wider">Items</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Total</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groupedRecentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium bg-gray-50/50">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                groupedRecentOrders.map((group: any) => (
                  <GroupedOrderRow key={group.userId} group={group} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
