import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/reviews
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

// POST /api/admin/reviews
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const review = await prisma.review.create({
    data: {
      name: name.trim(),
      location: location.trim(),
      rating: ratingNum,
      text: text.trim(),
      isVisible: isVisible !== false,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
