import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/delivery/check?pincode=XXX
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pincode = searchParams.get("pincode");

  if (!pincode || pincode.length !== 6) {
    return NextResponse.json({ allowed: false, message: "Invalid pincode" }, { status: 400 });
  }

  try {
    // 1. Check for exact pincode match
    const exactMatch = await prisma.deliveryZone.findFirst({
      where: { pincode },
    });

    if (exactMatch) {
      return NextResponse.json({
        allowed: exactMatch.isAllowed,
        courierPartner: exactMatch.courierPartner,
        minOrderValue: exactMatch.minOrderValue,
        notes: exactMatch.notes,
        message: exactMatch.isAllowed ? "Delivery available" : "Sorry, we don't deliver to this pincode",
      });
    }

    // 2. Check for state prefix match (first 2 digits)
    const statePrefix = pincode.substring(0, 2);
    const stateMatch = await prisma.deliveryZone.findFirst({
      where: { stateCode: statePrefix },
    });

    if (stateMatch) {
      return NextResponse.json({
        allowed: stateMatch.isAllowed,
        courierPartner: stateMatch.courierPartner,
        minOrderValue: stateMatch.minOrderValue,
        notes: stateMatch.notes,
        message: stateMatch.isAllowed ? "Delivery available" : "Sorry, we don't deliver to this state",
      });
    }

    // 3. Fallback to default setting
    const defaultAllowSetting = await prisma.siteConfig.findUnique({
      where: { key: "deliveryDefaultAllow" },
    });
    
    // Assume true if not explicitly set to "false"
    const isDefaultAllowed = defaultAllowSetting?.value !== "false";

    return NextResponse.json({
      allowed: isDefaultAllowed,
      message: isDefaultAllowed ? "Delivery available" : "Sorry, we don't deliver to this location currently",
    });

  } catch (error) {
    console.error("Delivery check error:", error);
    return NextResponse.json({ allowed: false, message: "Error checking delivery status" }, { status: 500 });
  }
}
