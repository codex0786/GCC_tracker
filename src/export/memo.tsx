import { Document, Page, Rect, StyleSheet, Svg, Text, View, pdf } from "@react-pdf/renderer";
import { FUNCTIONS, ONSHORE_LABEL, RE_MODEL_LABEL } from "@/data/benchmarks";
import { DATA_AS_OF } from "@/data/markets";
import { evaluate, type Evaluation } from "@/engine/evaluate";
import { hasStress, type Scenario } from "@/engine/scenario";
import { COST_LINES, COST_LINE_LABEL } from "@/engine/tco";
import { months, pct, usd } from "@/lib/format";
import { fileStamp, saveBlob } from "./download";

// Built-in PDF fonts cover WinAnsi only, so symbols outside it are spelled out.
const ascii = (s: string) =>
  s.replace(/₹/g, "INR ").replace(/≥/g, ">=").replace(/≤/g, "<=").replace(/≈/g, "~").replace(/−/g, "-").replace(/→/g, "->").replace(/[^\x00-\xff–—•×]/g, "");

const INK = "#0f1623";
const MUTED = "#5a6273";
const LINE = "#e2e5ea";
const ACCENT = "#1f5fbf";
const SERIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6"];

const st = StyleSheet.create({
  page: { padding: 40, fontSize: 9.5, color: INK, fontFamily: "Helvetica", lineHeight: 1.4 },
  eyebrow: { fontSize: 8, color: ACCENT, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  h1: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 4, marginBottom: 4, lineHeight: 1.25 },
  h2: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 6 },
  muted: { color: MUTED },
  box: { borderWidth: 1, borderColor: ACCENT, backgroundColor: "#f2f6fd", padding: 10, marginTop: 12, borderRadius: 4 },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINE, paddingVertical: 3 },
  kpis: { flexDirection: "row", gap: 8, marginTop: 12 },
  kpi: { flex: 1, borderWidth: 0.5, borderColor: LINE, padding: 8, borderRadius: 4 },
  kpiVal: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 2 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 7.5, color: MUTED, flexDirection: "row", justifyContent: "space-between" },
});

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={st.kpi}>
      <Text style={st.muted}>{label}</Text>
      <Text style={st.kpiVal}>{value}</Text>
    </View>
  );
}

function ScoreChart({ e }: { e: Evaluation }) {
  const w = 515;
  const rowH = 16;
  const labelW = 150;
  return (
    <View>
      {e.ranking.map((r, i) => (
        <View key={r.market.id} style={{ flexDirection: "row", alignItems: "center", height: rowH }}>
          <Text style={{ width: labelW, fontSize: 8.5 }}>{i + 1}. {r.market.name}</Text>
          <Svg width={w - labelW - 40} height={10}>
            <Rect x={0} y={1} width={((w - labelW - 40) * r.score) / 100} height={8} fill={i === 0 ? ACCENT : "#9fb4d6"} />
          </Svg>
          <Text style={{ width: 40, textAlign: "right", fontSize: 8.5 }}>{r.score.toFixed(1)}</Text>
        </View>
      ))}
    </View>
  );
}

function CostChart({ e }: { e: Evaluation }) {
  const years = e.financials.tco.years;
  const max = Math.max(...years.map((y) => y.total));
  const H = 120;
  const barW = 50;
  const gap = 40;
  return (
    <View>
      <Svg width={5 * (barW + gap)} height={H + 2}>
        {years.map((y, i) => {
          let acc = 0;
          return COST_LINES.map((k, j) => {
            const h = (y[k] / max) * H;
            acc += h;
            return <Rect key={`${i}-${k}`} x={i * (barW + gap)} y={H - acc} width={barW} height={Math.max(0, h - 0.6)} fill={SERIES[j]} />;
          });
        })}
      </Svg>
      <View style={{ flexDirection: "row" }}>
        {years.map((y) => (
          <Text key={y.year} style={{ width: barW + gap, fontSize: 8 }}>Y{y.year}: {usd(y.total)}</Text>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
        {COST_LINES.map((k, j) => (
          <View key={k} style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
            <View style={{ width: 7, height: 7, backgroundColor: SERIES[j], marginRight: 3 }} />
            <Text style={{ fontSize: 7.5, color: MUTED }}>{COST_LINE_LABEL[k]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Memo({ s, e, stressed }: { s: Scenario; e: Evaluation; stressed: boolean }) {
  const t = e.financials.tco;
  const tax = e.financials.tax;
  const fn = FUNCTIONS[s.fn].label;
  const risk = [...e.alerts].sort((a, b) => ["red", "amber", "info"].indexOf(a.level) - ["red", "amber", "info"].indexOf(b.level));
  return (
    <Document title="GCC-Nexus Board Memo" author="GCC-Nexus">
      <Page size="A4" style={st.page}>
        <Text style={st.eyebrow}>BOARD MEMORANDUM · INDIA GCC STRATEGY{stressed ? " · STRESS CASE" : ""}</Text>
        <Text style={st.h1}>{ascii(`${fn} capability centre: ${s.headcount.y5.toLocaleString()} FTE by year 5`)}</Text>
        <Text style={st.muted}>Prepared {fileStamp()} · Benchmarks {DATA_AS_OF}</Text>

        <View style={st.box}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 3 }}>Recommendation</Text>
          <Text>{ascii(`Anchor in ${e.ranking[0].market.name} (composite score ${e.ranking[0].score.toFixed(1)}/100). Financials modelled for ${e.selected.name} on a ${RE_MODEL_LABEL[s.reModel].toLowerCase()} basis.`)}</Text>
          <Text style={{ marginTop: 3 }}>{ascii(e.hubSpoke.recommendation)}</Text>
          <Text style={{ marginTop: 3 }}>{ascii(`Real estate: ${RE_MODEL_LABEL[e.reModels.best]} has the lowest 5-yr PV${e.reModels.crossoverMonth ? `; a warm-shell lease overtakes managed space from month ${e.reModels.crossoverMonth}` : ""}. Zone: ${tax.sez.recommendation}.`)}</Text>
        </View>

        <View style={st.kpis}>
          <Kpi label="5-yr India cash cost" value={usd(t.totalUsd)} />
          <Kpi label={`NPV savings vs ${ONSHORE_LABEL[s.macro.onshore]}`} value={usd(t.npvSavingsUsd)} />
          <Kpi label="Payback" value={months(t.paybackMonth)} />
          <Kpi label="TCO per seat (Y3)" value={usd(t.costPerSeatY3Usd, 0)} />
        </View>

        <Text style={st.h2} minPresenceAhead={70}>Micro-market ranking</Text>
        <ScoreChart e={e} />

        <Text style={st.h2} minPresenceAhead={70}>Five-year cash cost (USD)</Text>
        <CostChart e={e} />

        <Text style={st.h2} minPresenceAhead={70}>Risk register</Text>
        {risk.length === 0 && <Text style={st.muted}>No material risks flagged for this configuration.</Text>}
        {risk.map((a, i) => (
          <View key={i} style={st.row} wrap={false}>
            <Text style={{ width: 70, fontFamily: "Helvetica-Bold", color: a.level === "red" ? "#b42318" : a.level === "amber" ? "#a35f00" : ACCENT }}>
              {a.level === "red" ? "HIGH" : a.level === "amber" ? "MEDIUM" : "OPPORTUNITY"}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{ascii(a.title)}</Text>
              <Text style={st.muted}>{ascii(a.detail)}</Text>
            </View>
          </View>
        ))}

        <Text style={st.h2} minPresenceAhead={70}>Tax position</Text>
        <Text>{ascii(`Cost-plus markup ${pct(tax.markup)} on a ~INR ${tax.transactionInrCr.toFixed(0)} cr year-3 transaction. India ETR ${pct(tax.indiaEtr, 2)}. ${tax.pillarTwo.note}`)}</Text>
        {tax.ifsc.reasons.map((r) => <Text key={r} style={st.muted}>{ascii(r)}</Text>)}

        <Text style={st.h2} minPresenceAhead={70}>Key assumptions</Text>
        <Text style={st.muted}>
          {ascii(
            `USD/INR ${s.macro.fxInrPerUsd}; wage inflation ${s.macro.wageInflHotPct}% (hot skills) / ${s.macro.wageInflGeneralPct}% (general); WACC ${s.macro.waccPct}%; seating ${s.seatingRatio} FTE per desk; onshore output equivalence ramps 65% to 95% over 24 months; 20% of year-1 onshore cost charged for knowledge transfer. Benchmarks are indicative and compiled from public sources; tax parameters flagged for verification must be confirmed by a qualified adviser.`,
          )}
        </Text>

        <View style={st.footer} fixed>
          <Text>GCC-Nexus · India Strategic Advisory Engine</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export function memoDocument(s: Scenario) {
  const stressed = hasStress(s);
  return <Memo s={s} e={evaluate(s, stressed)} stressed={stressed} />;
}

export async function downloadMemo(s: Scenario) {
  const blob = await pdf(memoDocument(s)).toBlob();
  saveBlob(blob, `gcc-nexus-board-memo-${fileStamp()}.pdf`);
}
