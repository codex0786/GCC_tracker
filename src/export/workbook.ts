import ExcelJS from "exceljs";
import { BENCHMARK_META, FUNCTIONS, ONSHORE_LABEL, RE_MODEL_LABEL } from "@/data/benchmarks";
import { MARKET_META } from "@/data/markets";
import { evaluate } from "@/engine/evaluate";
import { CRITERIA, hasStress, type Scenario } from "@/engine/scenario";
import { CRITERION_DEFS } from "@/engine/mcda";
import { COST_LINES, COST_LINE_LABEL } from "@/engine/tco";
import { fileStamp, saveBlob } from "./download";

const USD = '"$"#,##0';
const COLS = ["B", "C", "D", "E", "F"];

/** Workbook with live formulas: totals, savings, cumulative savings and NPV recalculate in Excel. */
export async function downloadWorkbook(s: Scenario) {
  const e = evaluate(s, hasStress(s));
  const t = e.financials.tco;
  const wb = new ExcelJS.Workbook();
  wb.creator = "GCC-Nexus";

  const a = wb.addWorksheet("Assumptions");
  a.columns = [{ width: 34 }, { width: 28 }];
  const inputs: [string, string | number][] = [
    ["Function", FUNCTIONS[s.fn].label],
    ["Micro-market", e.selected.name],
    ["Headcount Day-1 / Y3 / Y5", `${s.headcount.day1} / ${s.headcount.y3} / ${s.headcount.y5}`],
    ["Real-estate model", RE_MODEL_LABEL[s.reModel]],
    ["Onshore comparator", ONSHORE_LABEL[s.macro.onshore]],
    ["USD/INR", s.macro.fxInrPerUsd],
    ["Wage inflation (hot / general) %", `${s.macro.wageInflHotPct} / ${s.macro.wageInflGeneralPct}`],
    ["Stress applied", hasStress(s) ? "Yes" : "No"],
  ];
  a.addRow(["GCC-Nexus scenario", ""]).font = { bold: true, size: 13 };
  inputs.forEach((r) => a.addRow(r));
  a.addRow(["WACC", s.macro.waccPct / 100]);
  const waccCell = `Assumptions!$B$${a.rowCount}`;
  a.getCell(`B${a.rowCount}`).numFmt = "0.0%";

  const cf = wb.addWorksheet("Cash Flow");
  cf.columns = [{ width: 32 }, ...COLS.map(() => ({ width: 15 }))];
  cf.addRow(["USD", ...t.years.map((y) => `Year ${y.year}`)]).font = { bold: true };
  cf.addRow(["Headcount (year-end)", ...t.years.map((y) => Math.round(y.hc))]);
  const first = cf.rowCount + 1;
  for (const k of COST_LINES) cf.addRow([COST_LINE_LABEL[k], ...t.years.map((y) => Math.round(y[k]))]);
  const last = cf.rowCount;
  const total = cf.addRow(["Total India cost", ...COLS.map((c) => ({ formula: `SUM(${c}${first}:${c}${last})` }))]);
  total.font = { bold: true };
  const totalRow = cf.rowCount;
  cf.addRow(["Onshore-equivalent cost", ...t.years.map((y) => Math.round(y.onshore))]);
  const onRow = cf.rowCount;
  cf.addRow(["Knowledge transfer (one-off)", Math.round(t.transitionUsd), 0, 0, 0, 0]);
  const ktRow = cf.rowCount;
  cf.addRow(["Net savings", ...COLS.map((c) => ({ formula: `${c}${onRow}-${c}${totalRow}-${c}${ktRow}` }))]).font = { bold: true };
  const savRow = cf.rowCount;
  cf.addRow(["Cumulative savings", ...COLS.map((c, i) => ({ formula: i === 0 ? `${c}${savRow}` : `${COLS[i - 1]}${savRow + 1}+${c}${savRow}` }))]);
  cf.addRow(["NPV of savings (annual, end-year)", { formula: `NPV(${waccCell},B${savRow}:F${savRow})` }]).font = { bold: true };
  cf.eachRow((row, i) => {
    if (i > 2) row.eachCell((cell, col) => col > 1 && (cell.numFmt = USD));
  });

  const mo = wb.addWorksheet("Monthly");
  mo.columns = [{ width: 8 }, { width: 10 }, ...COST_LINES.map(() => ({ width: 14 })), { width: 14 }, { width: 14 }];
  mo.addRow(["Month", "Headcount", ...COST_LINES.map((k) => COST_LINE_LABEL[k]), "Total", "Onshore"]).font = { bold: true };
  const end = String.fromCharCode(66 + COST_LINES.length);
  t.months.forEach((m, i) => {
    const r = i + 2;
    mo.addRow([m.month, Math.round(m.hc), ...COST_LINES.map((k) => Math.round(m[k])), { formula: `SUM(C${r}:${end}${r})` }, Math.round(m.onshore)]);
  });

  const rk = wb.addWorksheet("Market Ranking");
  rk.columns = [{ width: 6 }, { width: 30 }, { width: 10 }, ...CRITERIA.map(() => ({ width: 18 }))];
  rk.addRow(["Rank", "Micro-market", "Score", ...CRITERIA.map((c) => `${CRITERION_DEFS[c].label} (${s.weights[c]}%)`)]).font = { bold: true };
  e.ranking.forEach((r) => rk.addRow([r.rank, r.market.name, Number(r.score.toFixed(1)), ...CRITERIA.map((c) => Number(r.contribution[c].toFixed(1)))]));

  const src = wb.addWorksheet("Sources");
  src.columns = [{ width: 28 }, { width: 18 }, { width: 60 }, { width: 60 }, { width: 20 }];
  src.addRow(["Metric", "Unit", "Method", "Source", "As of"]).font = { bold: true };
  [...Object.values(MARKET_META), ...Object.values(BENCHMARK_META)].forEach((m) => m && src.addRow([m.label, m.unit ?? "", m.method, m.source, m.asOf]));

  const buf = await wb.xlsx.writeBuffer();
  saveBlob(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `gcc-nexus-model-${fileStamp()}.xlsx`);
}
