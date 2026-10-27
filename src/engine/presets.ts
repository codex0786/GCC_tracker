import { DEFAULT_SCENARIO, type CriterionId, type Scenario } from "./scenario";

export interface Preset {
  id: string;
  label: string;
  blurb: string;
  scenario: Scenario;
}

export const PRIORITY_MODES: { id: string; label: string; weights: Record<CriterionId, number> }[] = [
  { id: "balanced", label: "Balanced", weights: DEFAULT_SCENARIO.weights },
  { id: "cost", label: "Cost-first", weights: { cost: 50, seniorTalent: 20, attrition: 10, connectivity: 10, incentives: 10 } },
  { id: "talent", label: "Talent-first", weights: { cost: 15, seniorTalent: 50, attrition: 15, connectivity: 10, incentives: 10 } },
  { id: "incentives", label: "Incentive-led", weights: { cost: 25, seniorTalent: 20, attrition: 10, connectivity: 10, incentives: 35 } },
];

const base = DEFAULT_SCENARIO;

export const PRESETS: Preset[] = [
  { id: "genai", label: "GenAI scale-up", blurb: "800 FTE applied-AI centre, Hyderabad", scenario: base },
  {
    id: "vlsi",
    label: "VLSI design hub",
    blurb: "600 FTE chip design, talent-first",
    scenario: { ...base, fn: "vlsi", headcount: { day1: 50, y3: 300, y5: 600 }, marketId: "blr-orr", compute: "hpc", weights: PRIORITY_MODES[2].weights },
  },
  {
    id: "quant",
    label: "Quant desk in GIFT City",
    blurb: "300 FTE IFSC unit for a bank",
    scenario: {
      ...base,
      fn: "quant",
      headcount: { day1: 30, y3: 150, y5: 300 },
      marketId: "gift-city",
      compute: "elevated",
      weights: PRIORITY_MODES[3].weights,
      tax: { ...base.tax, financialServicesGroup: true },
    },
  },
  {
    id: "ops",
    label: "Ops spoke in Coimbatore",
    blurb: "1,200 FTE shared services vs UK",
    scenario: {
      ...base,
      fn: "shared-services",
      headcount: { day1: 100, y3: 600, y5: 1200 },
      marketId: "coimbatore",
      compute: "standard",
      reModel: "warm-shell",
      weights: PRIORITY_MODES[1].weights,
      macro: { ...base.macro, onshore: "uk" },
      mix: {
        day1: { "L1-L2": 45, "L3-L4": 35, "L5-L6": 15, "L7+": 5 },
        y3: { "L1-L2": 55, "L3-L4": 32, "L5-L6": 10, "L7+": 3 },
        y5: { "L1-L2": 60, "L3-L4": 30, "L5-L6": 8, "L7+": 2 },
      },
    },
  },
  {
    id: "sdv",
    label: "Auto SDV in Pune",
    blurb: "700 FTE software-defined vehicle, Germany parent",
    scenario: { ...base, fn: "auto-sdv", headcount: { day1: 60, y3: 350, y5: 700 }, marketId: "pune-hinjawadi", compute: "elevated", macro: { ...base.macro, onshore: "germany" } },
  },
];
