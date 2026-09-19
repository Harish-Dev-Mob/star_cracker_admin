import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// PUT /api/admin/categories/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, icon, image, sortOrder, isActive } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = slugify(name);

    // Ensure unique slug among other categories
    const existing = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
        icon: icon?.trim() || null,
        image: image?.trim() || null,
        sortOrder: Number(sortOrder) || 0,
        isActive: Boolean(isActive),
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json(category);
  } catch (err: any) {
    console.error("PUT Error:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Prevent deletion if products are linked
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete — ${count} product(s) are linked to this category. Reassign them first.`,
      },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
