import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decision cockpit · GCC Tracker",
  description: "Live GCC scenario dashboard: presets, India map, market ranking, savings and cost composition updating together.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
