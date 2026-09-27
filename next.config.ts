import type { NextConfig } from "next";

// Automatically use Render's provided URL in production to prevent localhost redirects
const renderUrl = process.env.RENDER_EXTERNAL_URL;
if (renderUrl) {
  process.env.AUTH_URL = renderUrl;
  process.env.NEXTAUTH_URL = renderUrl;
  process.env.NEXT_PUBLIC_SITE_URL = renderUrl;
  process.env.NEXT_PUBLIC_API_URL = `${renderUrl}/api`;
}

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
