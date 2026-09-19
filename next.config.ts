import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow any hostname for admin-uploaded banner/category images
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // Silence Prisma edge runtime warning in middleware
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
