import Link from "next/link";

const COLS = [
  { title: "Learn", links: [["What is a GCC?", "/learn/what-is-a-gcc"], ["Why India?", "/learn/why-india"], ["Setting up", "/learn/setup-roadmap"], ["Glossary", "/learn/glossary"], ["FAQ", "/learn/faq"]] },
  { title: "Explore", links: [["India vs other countries", "/markets/countries"], ["All markets", "/markets"], ["Bengaluru ORR", "/markets/blr-orr"], ["Hyderabad FD", "/markets/hyd-fd"], ["GIFT City", "/markets/gift-city"]] },
  { title: "Tools", links: [["Decision cockpit", "/tools"], ["Location", "/location"], ["5-Year TCO", "/financials"], ["Stress test", "/stress-test"], ["Benchmark my GCC", "/benchmark"]] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-panel/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="font-semibold">GCC Tracker</div>
          <p className="mt-2 max-w-xs text-sm text-muted">A free, independent guide to India&apos;s Global Capability Centres, with tools to model location, cost and risk.</p>
          <p className="mt-2 text-xs text-good">No sign-up · No sales call · Open methodology</p>
          <Link href="/methodology" className="mt-3 inline-block text-sm text-accent hover:underline">Methodology and sources →</Link>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">{c.title}</div>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-accent">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto max-w-7xl px-4 pb-8 text-xs text-muted sm:px-6">
        Indicative information compiled from public sources. Not legal, tax or investment advice.
      </p>
    </footer>
  );
}
