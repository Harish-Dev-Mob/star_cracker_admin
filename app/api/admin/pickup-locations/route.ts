import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/pickup-locations
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locations = await prisma.pickupLocation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(locations);
}

// POST /api/admin/pickup-locations
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, address, city, state, pincode, phone, isActive } = body;

  if (!name?.trim() || !address?.trim() || !city?.trim() || !state?.trim() || !pincode?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const location = await prisma.pickupLocation.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        phone: phone?.trim() || null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("Failed to create pickup location:", error);
    return NextResponse.json({ error: "Failed to create pickup location" }, { status: 500 });
  }
}
