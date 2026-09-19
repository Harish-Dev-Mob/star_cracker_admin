import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PUT /api/admin/delivery-zones/[id]
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
  const { pincode, stateCode, isAllowed, courierPartner, minOrderValue, notes } = body;

  try {
    const zone = await prisma.deliveryZone.update({
      where: { id },
      data: {
        pincode: pincode?.trim() || null,
        stateCode: stateCode?.trim() || null,
        isAllowed: isAllowed !== false,
        courierPartner: courierPartner?.trim() || null,
        minOrderValue: Number(minOrderValue) || 0,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(zone);
  } catch (error) {
    console.error("Failed to update delivery zone:", error);
    return NextResponse.json({ error: "Failed to update delivery zone" }, { status: 500 });
  }
}

// DELETE /api/admin/delivery-zones/[id]
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
    await prisma.deliveryZone.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete delivery zone:", error);
    return NextResponse.json({ error: "Failed to delete delivery zone" }, { status: 500 });
  }
}
