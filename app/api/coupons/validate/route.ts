import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const totalParam = searchParams.get("total");

    if (!code || !totalParam) {
      return NextResponse.json(
        { success: false, message: "Missing code or total" },
        { status: 400 }
      );
    }

    const total = parseFloat(totalParam);
    if (isNaN(total)) {
      return NextResponse.json(
        { success: false, message: "Invalid total" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, message: "Coupon is not active" },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: "Coupon has expired" },
        { status: 400 }
      );
    }

    if (total < coupon.minOrderValue) {
      return NextResponse.json(
        { success: false, message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` },
        { status: 400 }
      );
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: "Coupon usage limit reached" },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "PERCENT") {
      discount = Math.floor((total * coupon.value) / 100);
    } else {
      discount = coupon.value;
    }

    return NextResponse.json({
      success: true,
      discount,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    });

  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
