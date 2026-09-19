import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PUT /api/admin/coupons/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const body = await req.json();
  const { code, type, value, minOrderValue, expiresAt, isActive, usageLimit } = body;

  try {
    const data: any = {};
    if (code !== undefined) data.code = code.trim().toUpperCase();
    if (type !== undefined) data.type = type;
    if (value !== undefined) data.value = Number(value);
    if (minOrderValue !== undefined) data.minOrderValue = Number(minOrderValue);
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) data.isActive = isActive;
    if (usageLimit !== undefined) data.usageLimit = usageLimit ? Number(usageLimit) : null;

    const coupon = await prisma.coupon.update({
      where: { id },
      data,
    });

    return NextResponse.json(coupon);
  } catch (error: any) {
    console.error("Failed to update coupon:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Coupon code already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
