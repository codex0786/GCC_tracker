import type { MarketId } from "@/data/types";

export interface CityProfile {
  tagline: string;
  overview: string;
  strengths: string[];
  watchouts: string[];
  policy: string;
}

// Narrative profiles. Quantitative attributes come from src/data/markets.ts so the
// two never drift apart.
export const CITY_PROFILES: Record<MarketId, CityProfile> = {
  "blr-orr": {
    tagline: "India's deepest GCC ecosystem, at a premium",
    overview: "The Outer Ring Road corridor is the heart of Bengaluru's tech economy and the densest concentration of GCCs in the country. Almost every function has a mature talent pool here, from chip design to AI and product engineering.",
    strengths: ["Deepest senior and leadership talent in India", "Strongest ecosystem for semiconductors, AI and product engineering", "Widest choice of Grade-A campuses and enterprise landlords"],
    watchouts: ["Highest compensation and among the highest rents", "Fierce competition for talent and high attrition", "Traffic and commute times along the corridor"],
    policy: "Covered by the Karnataka GCC Policy 2024–29, which offers R&D grants, rental reimbursement and fast-track approvals.",
  },
  "blr-north": {
    tagline: "Bengaluru talent with an airport-side discount",
    overview: "The northern corridor towards Kempegowda International Airport has seen large new office supply. It draws on the same Bengaluru talent pool as ORR with somewhat lower rents and an easier commute for international travel.",
    strengths: ["Access to Bengaluru's talent pool", "Closest major tech district to the international airport", "New Grade-A supply gives tenants negotiating leverage"],
    watchouts: ["Some employees face long commutes from the south and east of the city", "Social infrastructure still catching up with office supply"],
    policy: "Covered by the Karnataka GCC Policy 2024–29.",
  },
  "hyd-fd": {
    tagline: "Fast-growing hub with strong policy support",
    overview: "Hyderabad's Financial District and HITEC City have become India's second-largest GCC hub by many counts. A responsive state administration, good infrastructure and a large talent base make it a frequent first choice for new centres.",
    strengths: ["Large, fast-growing talent pool across tech, pharma and finance", "Strong state support and quick approvals", "Good mass transit and newer infrastructure"],
    watchouts: ["Big lease deals can tighten vacancy quickly in specific districts", "Senior talent pool still thinner than Bengaluru's for some niches"],
    policy: "Telangana is known for single-window approvals and an active investment-promotion agency.",
  },
  "pune-hinjawadi": {
    tagline: "Engineering and automotive software heartland",
    overview: "Hinjawadi's IT parks sit close to India's automotive manufacturing base, which makes Pune a natural home for automotive software, embedded systems and engineering services, alongside large shared-services centres.",
    strengths: ["Strong automotive, embedded and engineering talent", "Lower cost than Bengaluru or Mumbai", "Good quality of life helps retention"],
    watchouts: ["Fewer direct international flights than other metros", "Local road congestion around Hinjawadi"],
    policy: "Covered by the Maharashtra GCC Policy 2025, which offers capital subsidy, payroll assistance and R&D grants.",
  },
  "chennai-omr": {
    tagline: "Stable, cost-effective and strong in operations",
    overview: "The Old Mahabalipuram Road corridor hosts a long-established IT and GCC base. Chennai is known for lower attrition, strong engineering colleges and a deep pool for finance, operations and automotive engineering.",
    strengths: ["Among the lowest attrition of the big metros", "Strong talent for engineering, finance and operations", "Competitive rents for Grade-A space"],
    watchouts: ["Smaller senior pool than Bengaluru for niche tech", "Monsoon flooding risk in some areas: check site resilience"],
    policy: "Tamil Nadu offers R&D and GCC incentives including land-cost support and training stipends.",
  },
  "gift-city": {
    tagline: "Tax-advantaged home for financial-services centres",
    overview: "GIFT City in Gandhinagar is India's International Financial Services Centre. For banks, insurers and other financial groups it offers a long income-tax holiday and a foreign-currency operating regime, but only for qualifying financial-services work.",
    strengths: ["100% income-tax deduction for 10 of 15 years for qualifying units", "Modern planned infrastructure and lower rents", "Gujarat GCC Policy 2025–30 support"],
    watchouts: ["Global In-house Centres may only serve their own financial-services group", "Small local talent pool: most senior hires relocate in", "Holiday can trigger a Pillar Two top-up for large groups"],
    policy: "Regulated by IFSCA; also eligible for Gujarat GCC Policy 2025–30 incentives.",
  },
  coimbatore: {
    tagline: "Tier-2 value with strong engineering roots",
    overview: "Coimbatore combines a manufacturing heritage with a growing IT base and good engineering colleges. It is a popular spoke for operations, shared services and engineering support at a much lower cost than the metros.",
    strengths: ["Much lower rent and compensation than Tier-1 cities", "Low attrition and loyal workforce", "Tamil Nadu support for Tier-2 expansion"],
    watchouts: ["Thin leadership bench: senior roles often need relocation premiums", "Limited international flights"],
    policy: "Tamil Nadu incentives increasingly target Tier-2 cities like Coimbatore.",
  },
  kochi: {
    tagline: "Quality of life and low attrition on the coast",
    overview: "Kochi's Infopark is Kerala's main tech hub. It offers a well-educated workforce, low attrition and good international connections to the Gulf, at Tier-2 costs.",
    strengths: ["Lowest attrition among the markets covered", "Low cost with good quality of life", "International airport with strong Gulf connectivity"],
    watchouts: ["Small senior talent pool", "Fewer large GCC peers to learn from or hire out of"],
    policy: "Kerala offers IT park infrastructure and state IT policy incentives.",
  },
  gurugram: {
    tagline: "NCR's corporate hub next to the capital's airport",
    overview: "Gurugram's Cyber City and Golf Course Road corridors host many global headquarters and GCCs, especially in finance, consulting, digital and shared services. Proximity to Delhi's international airport is a major draw.",
    strengths: ["Minutes from India's busiest international airport", "Deep pool for finance, analytics and shared services", "Large stock of premium Grade-A offices"],
    watchouts: ["Among the highest rents in the country", "Air quality and summer heat affect quality of life", "Incentives less generous than some states"],
    policy: "Haryana state IT policy applies; check current incentives with the state.",
  },
  noida: {
    tagline: "NCR scale at lower cost, with a dedicated GCC policy",
    overview: "The Noida–Greater Noida Expressway corridor offers large new campuses at lower rents than Gurugram. It has a notable semiconductor design and IT services base, and Uttar Pradesh has a dedicated GCC policy.",
    strengths: ["Lower rents than Gurugram with similar NCR talent access", "Growing semiconductor design and electronics ecosystem", "Uttar Pradesh GCC policy incentives"],
    watchouts: ["Further from Delhi's current international airport", "Some campuses are still building out social infrastructure"],
    policy: "Covered by Uttar Pradesh's dedicated GCC policy; check the state notification for current terms.",
  },
  mumbai: {
    tagline: "Financial capital with deep finance and analytics talent",
    overview: "Powai, Thane and nearby districts host many banking, insurance, analytics and pharma GCCs. Mumbai's pool of finance professionals is unmatched in India, at a cost and rent premium.",
    strengths: ["India's deepest finance and banking talent", "Strong pharma and healthcare analytics base", "Excellent international connectivity"],
    watchouts: ["High rents in prime districts and long commutes", "Competition from banks and financial firms for the same talent"],
    policy: "Covered by the Maharashtra GCC Policy 2025.",
  },
};
