import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/banners
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(banners);
}

// POST /api/admin/banners
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, imageUrl, linkUrl, sortOrder, isActive } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!imageUrl?.trim()) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  const banner = await prisma.banner.create({
    data: {
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl?.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      isActive: isActive !== false,
    },
  });

  return NextResponse.json(banner, { status: 201 });
}
