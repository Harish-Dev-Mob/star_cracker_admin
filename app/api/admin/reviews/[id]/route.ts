import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PUT /api/admin/reviews/[id]
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
  const { name, location, rating, text, isVisible } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!location?.trim()) {
    return NextResponse.json({ error: "Location is required" }, { status: 400 });
  }
  if (!text?.trim()) {
    return NextResponse.json({ error: "Review text is required" }, { status: 400 });
  }
  const ratingNum = Number(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const review = await prisma.review.update({
    where: { id },
    data: {
      name: name.trim(),
      location: location.trim(),
      rating: ratingNum,
      text: text.trim(),
      isVisible: Boolean(isVisible),
    },
  });

  return NextResponse.json(review);
}

// DELETE /api/admin/reviews/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
