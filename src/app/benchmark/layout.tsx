import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benchmark my GCC · GCC-Nexus",
  description: "Compare your Global Capability Centre's actual costs with a model for the same team, function and city in India. Runs in your browser; nothing is uploaded.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
