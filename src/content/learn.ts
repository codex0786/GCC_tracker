export type Block =
  | { p: string }
  | { list: string[] }
  | { callout: string; tone?: "info" | "warn" }
  | { table: { head: string[]; rows: string[][] } }
  | { steps: { title: string; text: string; time?: string }[] };

export interface Article {
  slug: string;
  title: string;
  summary: string;
  level: "Start here" | "Fundamentals" | "Going deeper";
  minutes: number;
  sections: { heading: string; blocks: Block[] }[];
  sources: string[];
  next?: { label: string; href: string };
}

export const ARTICLES: Article[] = [
  {
    slug: "what-is-a-gcc",
    title: "What is a Global Capability Centre?",
    summary: "The plain-English definition, what GCCs actually do, and how they differ from outsourcing.",
    level: "Start here",
    minutes: 4,
    sources: ["zinnovFy26", "fpjFy26"],
    next: { label: "Why India?", href: "/learn/why-india" },
    sections: [
      {
        heading: "The short answer",
        blocks: [
          { p: "A Global Capability Centre (GCC) is an offshore unit that a multinational company owns and runs itself, rather than hiring a vendor. It does work for the parent company: engineering, product development, analytics, finance, HR operations, cybersecurity, research and more." },
          { callout: "Think of a GCC as the company's own team in another country, on its own payroll, working on its own priorities. That is the key difference from outsourcing." },
        ],
      },
      {
        heading: "How GCCs evolved",
        blocks: [
          { p: "The first wave, in the 1990s and 2000s, was mostly about cost: back-office processing and IT support moved to cheaper locations. The model has since matured. Many centres in India now own whole products, run global functions and file patents." },
          {
            table: {
              head: ["Stage", "Typical work", "What the parent expects"],
              rows: [
                ["Cost centre", "Transactions, support, testing", "Lower cost per task"],
                ["Capability centre", "Engineering, analytics, shared services", "Skills and scale"],
                ["Innovation hub", "Product ownership, R&D, AI, global leadership roles", "New products and decisions made locally"],
              ],
            },
          },
        ],
      },
      {
        heading: "GCC vs outsourcing",
        blocks: [
          {
            table: {
              head: ["", "GCC (captive)", "Outsourcing vendor"],
              rows: [
                ["Who employs the people", "The parent company's Indian entity", "The vendor"],
                ["Control over hiring and IP", "Full", "Contractual"],
                ["Up-front effort", "Higher: entity, office, leadership", "Low"],
                ["Long-run cost", "Usually lower at scale", "Vendor margin included"],
                ["Best for", "Core, long-lived capabilities", "Well-defined, variable work"],
              ],
            },
          },
          { p: "Many companies mix the two, or start with a vendor that builds the centre and later hands it over (build-operate-transfer). See the operating models guide." },
        ],
      },
      {
        heading: "The scale in India today",
        blocks: [
          { list: ["About 2,117 GCCs operating 3,728 units (FY26).", "More than 2.36 million professionals employed.", "Roughly $98.4 billion in revenue in FY26."] },
          { callout: "These are industry estimates from Nasscom–Zinnov. Different consultants count centres differently, so totals vary between reports.", tone: "info" },
        ],
      },
    ],
  },
  {
    slug: "why-india",
    title: "Why India?",
    summary: "The four reasons most companies choose India, and the risks to plan for.",
    level: "Start here",
    minutes: 5,
    sources: ["zinnovFy26", "vestianCities", "jllGuide", "cbreStates"],
    next: { label: "Choosing an operating model", href: "/learn/operating-models" },
    sections: [
      {
        heading: "1. Talent at scale",
        blocks: [
          { p: "India produces one of the world's largest pools of engineering and commerce graduates every year, and the GCC sector alone already employs more than 2.36 million people. Mature hubs also have deep benches of senior engineers and leaders who have run global teams." },
        ],
      },
      {
        heading: "2. Cost",
        blocks: [
          { p: "A fully loaded seat in India typically costs a fraction of the same role in the US or Western Europe. In this tool's default GenAI scenario, the five-year cost is about 65% lower than producing the same output in the US, after allowing for a productivity ramp-up and knowledge-transfer costs." },
          { callout: "Cost is the reason most companies come. It is rarely the reason they stay. Mature GCCs are judged on capability, speed and ownership.", tone: "info" },
        ],
      },
      {
        heading: "3. A mature ecosystem",
        blocks: [
          { p: "Six metros host about 94% of India's GCCs. That density brings experienced vendors, landlords who understand enterprise tenants, specialist recruiters and a large pool of people who have already worked in GCCs." },
        ],
      },
      {
        heading: "4. Active state support",
        blocks: [
          { p: "Several states now publish dedicated GCC policies offering capital subsidies, payroll support, rental reimbursement and faster approvals. CBRE estimates the states together are targeting more than 1.1 million GCC jobs and 1,300+ new centres by 2031." },
        ],
      },
      {
        heading: "Risks to plan for",
        blocks: [
          {
            list: [
              "Wage inflation for hot skills such as AI, chip design and automotive software can run well into double digits.",
              "Attrition: competition for talent is intense in the densest micro-markets.",
              "Leadership depth outside the big hubs: senior roles in Tier-2 cities often need relocation premiums.",
              "Office supply: large lease deals can tighten vacancy and push up rents in specific districts.",
            ],
          },
          { p: "The Stress test tool lets you apply each of these as a shock to your own plan." },
        ],
      },
    ],
  },
  {
    slug: "operating-models",
    title: "Choosing an operating model",
    summary: "Captive, build-operate-transfer, managed and hybrid: what each means and when it fits.",
    level: "Fundamentals",
    minutes: 5,
    sources: [],
    next: { label: "How to set up a GCC", href: "/learn/setup-roadmap" },
    sections: [
      {
        heading: "The four common models",
        blocks: [
          {
            table: {
              head: ["Model", "How it works", "Speed to start", "Control", "Fits when"],
              rows: [
                ["Captive", "You set up your own Indian company and hire directly", "Slower (months)", "Full", "You know what you want and plan to stay long-term"],
                ["Build-operate-transfer (BOT)", "A partner builds and runs the centre, then transfers it to you, usually after 2–4 years", "Fast", "Grows over time", "You want speed now and ownership later"],
                ["Managed / GCC-as-a-service", "A partner employs staff and runs operations on your behalf", "Fastest", "Partial", "Small teams, pilots or uncertain demand"],
                ["Hybrid", "Captive core with a partner for specific functions or overflow", "Varies", "High on the core", "Mixed workloads"],
              ],
            },
          },
        ],
      },
      {
        heading: "How to decide",
        blocks: [
          {
            list: [
              "Expected size: below roughly 50 people, a managed or BOT model avoids fixed set-up costs.",
              "Time pressure: if you need people in seats within weeks, start with a partner.",
              "Sensitivity of the work: IP-heavy product and R&D work usually favours a captive from day one.",
              "Exit flexibility: BOT contracts should spell out transfer price, timing and who owns the employees.",
            ],
          },
          { callout: "The financial model in this tool assumes a captive centre. A managed office is offered as a real-estate choice, not as a different employment model.", tone: "info" },
        ],
      },
    ],
  },
  {
    slug: "setup-roadmap",
    title: "How to set up a GCC in India",
    summary: "The usual sequence from business case to the first 100 people, with typical timelines.",
    level: "Fundamentals",
    minutes: 6,
    sources: ["budget2026Tp"],
    next: { label: "Policy and tax basics", href: "/learn/policy-and-tax" },
    sections: [
      {
        heading: "Typical sequence",
        blocks: [
          {
            steps: [
              { title: "Business case and mandate", time: "4–8 weeks", text: "Decide what the centre will own, how big it should get and how success will be measured. Build the 5-year cost model." },
              { title: "Location choice", time: "4–6 weeks", text: "Shortlist cities and micro-markets on cost, talent depth, attrition, connectivity and state incentives." },
              { title: "Entity set-up", time: "3–6 weeks", text: "Most GCCs register a private limited subsidiary. IT and IT-enabled services allow 100% foreign ownership under the automatic route. Incorporation, tax registrations (PAN, TAN, GST) and a bank account follow." },
              { title: "Foreign-investment reporting", time: "Within 30 days of share allotment", text: "Capital brought in from the parent must be reported to the Reserve Bank of India through the authorised bank." },
              { title: "Transfer-pricing policy", time: "Before first invoice", text: "The Indian entity bills the parent cost plus a markup. From FY 2026-27 IT services can opt into a 15.5% safe-harbour markup for transactions up to ₹2,000 crore." },
              { title: "Office", time: "Day 1: weeks · Lease: 3–6 months", text: "Most centres start in managed space and move to a leased, fitted-out office once headcount is predictable." },
              { title: "Leadership first", time: "2–4 months", text: "Hire the site leader and function heads before the bulk of the team. They shape culture and the rest of the hiring." },
              { title: "Payroll and statutory compliance", time: "Ongoing", text: "Provident fund, gratuity, professional tax, shops-and-establishments registration and state labour rules." },
              { title: "Ramp", time: "6–12 months to ~100 people", text: "Knowledge transfer from the parent runs in parallel. Productivity usually takes 12–24 months to approach onshore levels." },
            ],
          },
          { callout: "General guidance only, not legal or tax advice. Requirements change and vary by state, so confirm the details with advisers.", tone: "warn" },
        ],
      },
    ],
  },
  {
    slug: "policy-and-tax",
    title: "Policy and tax basics",
    summary: "State GCC policies, transfer pricing, GIFT City, SEZs and the global minimum tax, in plain English.",
    level: "Going deeper",
    minutes: 7,
    sources: ["lawAsiaStates", "maharashtraPolicy", "gujaratPolicy", "rajasthanPolicy", "cbreStates", "budget2026Tp", "ifscaGic", "investIndiaGic"],
    next: { label: "Explore city profiles", href: "/markets" },
    sections: [
      {
        heading: "State GCC policies",
        blocks: [
          { p: "Since 2024 several states have published dedicated GCC policies. They compete on capital subsidies, payroll and rental support, R&D grants and approval speed. The table on the home page summarises the main ones; always check the official notification for current terms." },
        ],
      },
      {
        heading: "Transfer pricing",
        blocks: [
          { p: "A captive GCC is usually paid by its parent on a cost-plus basis: the parent reimburses all costs plus a markup, and India taxes that markup as profit. The markup has to be at arm's length, which historically led to disputes." },
          { p: "Union Budget 2026 grouped IT services into one safe-harbour category with a 15.5% markup, raised eligibility to transactions up to ₹2,000 crore, made approval automatic and let companies lock it in for five years. It also proposed fast-tracking advance pricing agreements for IT services." },
          { callout: "The detailed rules come by CBDT notification. Treat the 15.5% figure as the headline policy and confirm the operative rules before relying on it.", tone: "warn" },
        ],
      },
      {
        heading: "GIFT City (IFSC)",
        blocks: [
          { p: "GIFT City in Gujarat is India's International Financial Services Centre. Units there can claim a 100% income-tax deduction for 10 consecutive years out of 15. A Global In-house Centre in GIFT City may only serve its own financial-services group, and its work must relate to financial services." },
          { p: "So GIFT City suits banks, insurers, asset managers and other financial groups. A semiconductor or automotive GCC would not qualify." },
        ],
      },
      {
        heading: "SEZ or regular zone?",
        blocks: [
          { p: "Special Economic Zone units that started after 31 March 2020 no longer get an income-tax holiday. What remains is mainly duty-free import of equipment and some stamp-duty relief, balanced against extra compliance. For most new GCCs the choice now turns on hardware imports and on whether they will sell inside India." },
        ],
      },
      {
        heading: "Global minimum tax (Pillar Two)",
        blocks: [
          { p: "Groups with revenue of €750 million or more face a 15% global minimum tax. India's standard corporate rate (about 25%) is above that, so most GCCs are unaffected. It matters mainly where a tax holiday, such as GIFT City's, pushes the effective rate below 15%: the parent's country may then collect a top-up." },
        ],
      },
    ],
  },
];

export const ARTICLE_BY_SLUG = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));
