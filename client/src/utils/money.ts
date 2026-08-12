const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const compact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** ₹22,000 - the default money format used across the app. */
export function formatMoney(value: number): string {
  return currency.format(roundMoney(value));
}

/** ₹22.0K - used where space is tight, e.g. chart labels. */
export function formatMoneyCompact(value: number): string {
  return compact.format(roundMoney(value));
}

/** +₹2,000 / -₹500 - for transaction rows where direction matters. */
export function formatSignedMoney(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${currency.format(Math.abs(roundMoney(value)))}`;
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Parses free-typed amount text ("1,200.50") into a number, or null if unusable. */
export function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[,\s₹]/g, '');
  if (cleaned.length === 0) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? roundMoney(parsed) : null;
}
