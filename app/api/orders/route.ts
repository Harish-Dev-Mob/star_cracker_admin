import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, address, pickupLocationId, deliveryType, ageConsent, termsAccepted, notes, couponCode } = body;

    if (!items || !items.length || (!address && !pickupLocationId) || !ageConsent || !termsAccepted) {
      return NextResponse.json(
        { success: false, message: "Missing required fields or consent not provided" },
        { status: 400 }
      );
    }

    // 0. Pre-checks: Cutoff Date and Delivery Min Value
    const siteConfigs = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: ["orderCutoffDate", "minOrderValueForDelivery"]
        }
      }
    });
    
    const configMap = siteConfigs.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    if (configMap.orderCutoffDate) {
      const cutoff = new Date(configMap.orderCutoffDate);
      if (new Date() > cutoff) {
        return NextResponse.json(
          { success: false, message: "Orders are currently closed for the season." },
          { status: 403 }
        );
      }
    }

    // 1. Calculate totals from DB to prevent tampering
    let subtotal = 0;
    const orderItemsData: { productId: string; quantity: number; priceAtOrder: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        return NextResponse.json(
          { success: false, message: `Product ${item.productId} is unavailable` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const price = product.discountPrice ?? product.price;
      subtotal += price * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtOrder: price,
      });
    }

    // 2. Coupon Validation
    let discount = 0;
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (subtotal >= coupon.minOrderValue) {
          if (coupon.type === "PERCENT") {
            discount = Math.floor((subtotal * coupon.value) / 100);
          } else {
            discount = coupon.value;
          }
          
          if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
             discount = 0;
          } else {
            appliedCouponCode = coupon.code;
          }
        }
      }
    }

    // 3. Delivery Fee and Min Order Check
    const minOrderValue = Number(configMap.minOrderValueForDelivery) || 0;
    const isDelivery = deliveryType !== "PICKUP";
    
    if (isDelivery && subtotal < minOrderValue) {
      return NextResponse.json(
        { success: false, message: `Minimum order value for delivery is ₹${minOrderValue}` },
        { status: 400 }
      );
    }

    const deliveryFee = (isDelivery && subtotal >= 999) || !isDelivery ? 0 : 49;
    const total = subtotal - discount + deliveryFee;

    // 4. Create Order Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Deduct stock
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Update coupon usage
      if (appliedCouponCode) {
        await tx.coupon.update({
          where: { code: appliedCouponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Save Address (or find existing for user)
      let savedAddressId = undefined;
      if (userId && isDelivery && address) {
        const newAddress = await tx.address.create({
           data: {
             ...address,
             userId: userId,
           }
        });
        savedAddressId = newAddress.id;
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: "PLACED",
          paymentMode: "COD",
          deliveryType: isDelivery ? "DELIVERY" : "PICKUP",
          subtotal,
          discount,
          total,
          couponCode: appliedCouponCode,
          notes,
          ageConsent: ageConsent,
          termsAcceptedAt: termsAccepted ? new Date() : null,
          returnEligible: true,
          orderItems: {
            create: orderItemsData,
          },
          addressId: isDelivery ? savedAddressId : null,
          pickupLocationId: !isDelivery ? pickupLocationId : null,
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: order.id,
    });

  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
