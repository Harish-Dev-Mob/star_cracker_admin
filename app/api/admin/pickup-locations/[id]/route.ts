import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PUT /api/admin/pickup-locations/[id]
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
  const { name, address, city, state, pincode, phone, isActive } = body;

  try {
    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (address !== undefined) data.address = address.trim();
    if (city !== undefined) data.city = city.trim();
    if (state !== undefined) data.state = state.trim();
    if (pincode !== undefined) data.pincode = pincode.trim();
    if (phone !== undefined) data.phone = phone?.trim() || null;
    if (isActive !== undefined) data.isActive = isActive;

    const location = await prisma.pickupLocation.update({
      where: { id },
      data,
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("Failed to update pickup location:", error);
    return NextResponse.json({ error: "Failed to update pickup location" }, { status: 500 });
  }
}

// DELETE /api/admin/pickup-locations/[id]
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
    await prisma.pickupLocation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete pickup location:", error);
    return NextResponse.json({ error: "Failed to delete pickup location" }, { status: 500 });
  }
}
