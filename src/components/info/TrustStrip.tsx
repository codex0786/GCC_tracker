import { BookOpenCheck, Lock, PhoneOff, UserX } from "lucide-react";
import Link from "next/link";

export const TRUST_POINTS = [
  { icon: UserX, label: "No sign-up" },
  { icon: PhoneOff, label: "No sales call" },
  { icon: BookOpenCheck, label: "Open methodology", href: "/methodology" },
  { icon: Lock, label: "Runs in your browser" },
];

export function TrustStrip({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {TRUST_POINTS.map(({ icon: Icon, label, href }) => {
        const inner = (
          <>
            <Icon size={14} className="text-good" /> {label}
          </>
        );
        return (
          <li key={label}>
            {href ? (
              <Link href={href} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel/70 px-3 py-1 text-xs font-medium backdrop-blur hover:border-accent">
                {inner}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel/70 px-3 py-1 text-xs font-medium backdrop-blur">{inner}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
