import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GCC-Nexus · India Strategic Advisory Engine",
  description: "Decision support for Global Capability Centre site selection, 5-year TCO, talent feasibility, tax strategy and market stress-testing in India.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
