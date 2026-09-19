import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/public/banners — returns all active banners, no auth required
export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      linkUrl: true,
      sortOrder: true,
      isActive: true,
    },
  });

  return NextResponse.json(banners);
}
