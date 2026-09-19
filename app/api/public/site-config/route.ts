import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/public/site-config
export async function GET() {
  // Only fetch specific keys that are safe to expose to the public
  const allowedKeys = [
    "ageGateEnabled",
    "ageGateText",
    "licenseNumber",
    "pesoCceDetails",
    "disclaimerText",
    "minOrderValueForDelivery",
    "selfPickupEnabled",
    "orderCutoffDate",
    "deliveryDefaultAllow",
    "defaultCourierPartner",
    "deliveryFee",
    "freeDeliveryThreshold",
    "topBannerEnabled",
    "topBannerText",
  ];

  const settings = await prisma.siteConfig.findMany({
    where: {
      key: {
        in: allowedKeys,
      },
    },
  });
  
  // Convert array of {key, value} to an object
  const settingsObj = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return NextResponse.json(settingsObj);
}
