import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

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
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: totalRevenueData._sum.total || 0,
        totalOrders,
        totalProducts,
        totalCustomers,
        recentOrders
      }
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
