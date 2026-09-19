import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/admin/stocks/adjust
// Body: { productId: string, delta: number }
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, delta } = body;

  if (!productId || typeof delta !== "number" || !Number.isInteger(delta)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Fetch current stock first to prevent going below 0
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const newStock = Math.max(0, product.stock + delta);

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { stock: newStock },
    select: { id: true, name: true, stock: true, lowStockThreshold: true },
  });

  return NextResponse.json(updated);
}
