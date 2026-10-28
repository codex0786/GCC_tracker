import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Location optimiser · GCC Tracker",
  description: "Rank India's GCC micro-markets on cost, talent, attrition, connectivity and incentives, with trade-offs and hub-and-spoke splits.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
