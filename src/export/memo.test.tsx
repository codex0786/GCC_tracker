import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";
import { DEFAULT_SCENARIO } from "@/engine/scenario";
import { memoDocument } from "./memo";

describe("Board memo", () => {
  it("renders a PDF for baseline and stressed scenarios", async () => {
    for (const s of [DEFAULT_SCENARIO, { ...DEFAULT_SCENARIO, marketId: "gift-city" as const, fn: "quant" as const, stress: { ...DEFAULT_SCENARIO.stress, wageSpikePp: 4 } }]) {
      const buf = await renderToBuffer(memoDocument(s));
      expect(buf.subarray(0, 4).toString()).toBe("%PDF");
      expect(buf.length).toBeGreaterThan(5000);
    }
  }, 30000);
});
