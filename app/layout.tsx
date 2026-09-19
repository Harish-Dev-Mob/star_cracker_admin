import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "StarCracker — Premium Fireworks & Sparklers",
    template: "%s | StarCracker",
  },
  description:
    "Shop premium quality firecrackers, sparklers, rockets, and combo packs for every festival. Safe, vibrant, and delivered to your door.",
  keywords: ["firecrackers", "sparklers", "fireworks", "diwali", "rockets", "fountains", "buy online"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://star-cracker-admin.onrender.com",
    siteName: "StarCracker",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
          <SessionProvider>
            <main className="flex-1">{children}</main>
            <ToastProvider />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
