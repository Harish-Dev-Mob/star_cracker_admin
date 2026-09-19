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

// GET /api/admin/categories
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(categories);
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, icon, image, sortOrder, isActive } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = slugify(name);

  // Ensure unique slug
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "A category with this name already exists" },
      { status: 409 }
    );
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      slug,
      icon: icon?.trim() || null,
      image: image?.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== false,
    },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(category, { status: 201 });
}
