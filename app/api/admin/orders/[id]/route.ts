import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VALID_STATUSES = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

// GET /api/admin/orders/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
      address: true,
      orderItems: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, images: true, price: true, discountPrice: true },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

// PATCH /api/admin/orders/[id] — update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, returnEligible } = body;

  const updateData: any = {};
  if (status && VALID_STATUSES.includes(status)) {
    updateData.status = status;
  }
  if (returnEligible !== undefined) {
    updateData.returnEligible = returnEligible;
  }
  
  if (status === "SHIPPED") {
    updateData.returnEligible = false;
  }

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
      address: true,
      orderItems: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, images: true, price: true, discountPrice: true },
          },
        },
      },
    },
  });

  return NextResponse.json(order);
}
