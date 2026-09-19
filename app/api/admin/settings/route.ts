import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/settings
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.siteConfig.findMany();
  
  // Convert array of {key, value} to an object
  const settingsObj = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return NextResponse.json(settingsObj);
}

// PUT /api/admin/settings
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Update or create each setting
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await prisma.siteConfig.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Settings PUT Error:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
