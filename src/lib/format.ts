export function usd(n: number, digits = 1) {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(digits)}B`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(digits)}M`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(0)}K`;
  return `${sign}$${a.toFixed(0)}`;
}

export const pct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`;
export const int = (n: number) => Math.round(n).toLocaleString("en-IN");
export const months = (m: number | null) => (m === null ? "Beyond 5 yrs" : `${m} mo`);
