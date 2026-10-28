import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://gcc-tracker-india.vercel.app"),
  openGraph: { siteName: "GCC Tracker", type: "website" },
  title: "GCC Tracker · India's Global Capability Centres, tracked and modelled",
  description: "Independent guide and decision tools for Global Capability Centres in India: no sign-up, no sales call, open methodology.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
