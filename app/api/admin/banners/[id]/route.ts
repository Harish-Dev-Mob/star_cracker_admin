import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PUT /api/admin/banners/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, imageUrl, linkUrl, sortOrder, isActive } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!imageUrl?.trim()) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
  }

  const banner = await prisma.banner.update({
    where: { id },
    data: {
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl?.trim() || null,
      sortOrder: Number(sortOrder) || 0,
      isActive: Boolean(isActive),
    },
  });

  return NextResponse.json(banner);
}

// DELETE /api/admin/banners/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
