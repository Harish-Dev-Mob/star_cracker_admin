import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/combos/[id]
export async function GET(
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

  const combo = await prisma.combo.findUnique({
    where: { id },
    include: {
      comboItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!combo) {
    return NextResponse.json({ error: "Combo not found" }, { status: 404 });
  }

  return NextResponse.json(combo);
}

// PUT /api/admin/combos/[id]
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
  const { name, slug, description, images, price, discountPrice, isActive, isFeatured, items } = body;

  try {
    const combo = await prisma.$transaction(async (tx) => {
      // Delete existing combo items
      await tx.comboItem.deleteMany({
        where: { comboId: id },
      });

      // Update combo and create new items
      return await tx.combo.update({
        where: { id },
        data: {
          name: name?.trim(),
          slug: slug?.trim(),
          description: description?.trim(),
          images: images,
          price: price !== undefined ? Number(price) : undefined,
          discountPrice: discountPrice !== undefined ? (discountPrice ? Number(discountPrice) : null) : undefined,
          isActive: isActive !== undefined ? isActive : undefined,
          isFeatured: isFeatured !== undefined ? isFeatured : undefined,
          comboItems: items ? {
            create: items.map((item: { productId: string; quantity: number }) => ({
              productId: item.productId,
              quantity: Number(item.quantity) || 1,
            })),
          } : undefined,
        },
        include: {
          comboItems: true,
        },
      });
    });

    return NextResponse.json(combo);
  } catch (error) {
    console.error("Failed to update combo:", error);
    return NextResponse.json({ error: "Failed to update combo" }, { status: 500 });
  }
}

// DELETE /api/admin/combos/[id]
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
    await prisma.combo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete combo:", error);
    return NextResponse.json({ error: "Failed to delete combo" }, { status: 500 });
  }
}
