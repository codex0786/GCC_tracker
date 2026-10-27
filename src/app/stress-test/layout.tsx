import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GCC stress test · GCC-Nexus",
  description: "Apply market signals, wage, FX, rent and AI-displacement shocks to a GCC plan and run a Monte Carlo simulation.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
