import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/coupons
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(coupons);
}

// POST /api/admin/coupons
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { code, type, value, minOrderValue, expiresAt, isActive, usageLimit } = body;

  if (!code?.trim() || !type || value === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minOrderValue: Number(minOrderValue) || 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== false,
        usageLimit: usageLimit ? Number(usageLimit) : null,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create coupon:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Coupon code already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
