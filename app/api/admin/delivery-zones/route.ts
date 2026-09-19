import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/delivery-zones
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const zones = await prisma.deliveryZone.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(zones);
}

// POST /api/admin/delivery-zones
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Handle bulk insert (array) or single insert (object)
  if (Array.isArray(body)) {
    const validData = body.map(zone => ({
      pincode: zone.pincode?.trim() || null,
      stateCode: zone.stateCode?.trim() || null,
      isAllowed: zone.isAllowed !== false,
      courierPartner: zone.courierPartner?.trim() || null,
      minOrderValue: Number(zone.minOrderValue) || 0,
      notes: zone.notes?.trim() || null,
    })).filter(z => z.pincode || z.stateCode); // Must have at least one

    const result = await prisma.deliveryZone.createMany({
      data: validData,
    });
    
    return NextResponse.json({ count: result.count }, { status: 201 });
  } else {
    const { pincode, stateCode, isAllowed, courierPartner, minOrderValue, notes } = body;

    if (!pincode?.trim() && !stateCode?.trim()) {
      return NextResponse.json({ error: "Pincode or State Code is required" }, { status: 400 });
    }

    const zone = await prisma.deliveryZone.create({
      data: {
        pincode: pincode?.trim() || null,
        stateCode: stateCode?.trim() || null,
        isAllowed: isAllowed !== false,
        courierPartner: courierPartner?.trim() || null,
        minOrderValue: Number(minOrderValue) || 0,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(zone, { status: 201 });
  }
}
