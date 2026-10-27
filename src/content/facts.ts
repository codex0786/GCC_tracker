import type { MarketId } from "@/data/types";

export interface Fact {
  value: number;
  label: string;
  format: "int" | "usdB" | "millions" | "pct";
  source: string;
  note?: string;
}

export const LANDSCAPE_FACTS: Fact[] = [
  { value: 2117, label: "GCCs in India", format: "int", source: "zinnovFy26", note: "operating 3,728 units, FY26" },
  { value: 2.36, label: "professionals employed", format: "millions", source: "fpjFy26", note: "FY26" },
  { value: 98.4, label: "GCC revenue, FY26", format: "usdB", source: "fpjFy26", note: "about 32% growth since FY21" },
  { value: 0.94, label: "of GCCs sit in six metros", format: "pct", source: "vestianCities", note: "Bengaluru, Hyderabad, NCR, Mumbai, Pune, Chennai" },
];

/** GCC counts by metro, Vestian (July 2025). Consultants count differently; treat as indicative. */
export const CITY_COUNTS: { city: string; count: number; markets: MarketId[] }[] = [
  { city: "Bengaluru", count: 487, markets: ["blr-orr", "blr-north"] },
  { city: "Hyderabad", count: 273, markets: ["hyd-fd"] },
  { city: "Delhi NCR", count: 272, markets: ["gurugram", "noida"] },
  { city: "Mumbai", count: 207, markets: ["mumbai"] },
  { city: "Pune", count: 178, markets: ["pune-hinjawadi"] },
  { city: "Chennai", count: 162, markets: ["chennai-omr"] },
];

export interface StatePolicy {
  state: string;
  name: string;
  period: string;
  headline: string;
  source: string;
}

export const STATE_POLICIES: StatePolicy[] = [
  { state: "Karnataka", name: "Karnataka GCC Policy", period: "2024–29", headline: "Targets 500 new GCCs and 3.5 lakh jobs; R&D grants, rental reimbursement and a 45-day approval timeline.", source: "lawAsiaStates" },
  { state: "Maharashtra", name: "Maharashtra GCC Policy 2025", period: "to FY 2029–30", headline: "Targets 400 new GCCs and 4 lakh high-skilled jobs; capital subsidy, payroll assistance, R&D grants and interest subsidy.", source: "maharashtraPolicy" },
  { state: "Gujarat", name: "Gujarat GCC Policy", period: "2025–30", headline: "Capital and operating subsidies tiered by investment; support stops if headcount stays below 50 for three months.", source: "gujaratPolicy" },
  { state: "Uttar Pradesh", name: "UP GCC Policy", period: "2024 onwards", headline: "Dedicated GCC policy aimed at Noida and Greater Noida; check the state notification for current incentive terms.", source: "cbreStates" },
  { state: "Rajasthan", name: "Rajasthan GCC Policy", period: "2025 onwards", headline: "Dedicated GCC policy announced December 2025 to draw centres to Jaipur and other cities.", source: "rajasthanPolicy" },
  { state: "Tamil Nadu", name: "R&D and GCC incentives", period: "Current", headline: "No standalone GCC policy in some readings; land-cost support up to 50%, IP-filing reimbursement and training stipends.", source: "lawAsiaStates" },
];

export const STATE_TARGETS = { jobs: "1.1 million+", gccs: "1,300+", by: "2031", source: "cbreStates" };
