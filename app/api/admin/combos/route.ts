import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/combos
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const combos = await prisma.combo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      comboItems: {
        include: {
          product: true,
        },
      },
    },
  });

  return NextResponse.json(combos);
}

// POST /api/admin/combos
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, description, images, price, discountPrice, isActive, isFeatured, items } = body;

  if (!name?.trim() || !slug?.trim() || !items || !Array.isArray(items)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const combo = await prisma.combo.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description: description?.trim() || "",
        images: images || "[]",
        price: Number(price) || 0,
        discountPrice: discountPrice ? Number(discountPrice) : null,
        isActive: isActive !== false,
        isFeatured: isFeatured === true,
        comboItems: {
          create: items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: Number(item.quantity) || 1,
          })),
        },
      },
      include: {
        comboItems: true,
      },
    });

    return NextResponse.json(combo, { status: 201 });
  } catch (error) {
    console.error("Failed to create combo:", error);
    return NextResponse.json({ error: "Failed to create combo. Slug might not be unique." }, { status: 500 });
  }
}
