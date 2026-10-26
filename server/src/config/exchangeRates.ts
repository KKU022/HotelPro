/**
 * Reference Exchange Rate Matrix (Updated: October 2026 Reference Snapshot)
 * Base Reference: Indian Rupee (INR)
 */
export const EXCHANGE_RATES_TO_INR: Record<string, number> = {
  INR: 1.0,
  USD: 86.50,
  EUR: 93.20,
  GBP: 111.40,
  AED: 23.55,
  SGD: 64.80,
  THB: 2.45,
  IDR: 0.0054,
  JPY: 0.58,
};

export const EXCHANGE_RATE_LAST_UPDATED = '2026-10-26T00:00:00Z';

/**
 * Safely convert amount between supported currency codes
 */
export function convertCurrency(amount: number, from: string, to: string): number {
  const normalizedFrom = from.toUpperCase();
  const normalizedTo = to.toUpperCase();

  if (normalizedFrom === normalizedTo) return amount;

  const fromRate = EXCHANGE_RATES_TO_INR[normalizedFrom];
  const toRate = EXCHANGE_RATES_TO_INR[normalizedTo];

  if (!fromRate || !toRate) {
    // If currency not in table, fallback to 1:1
    return amount;
  }

  // Convert to INR base, then to target currency
  const inrAmount = amount * fromRate;
  const targetAmount = inrAmount / toRate;

  // Round to nearest integer for INR/JPY, or 2 decimal places for standard fiat
  if (normalizedTo === 'INR' || normalizedTo === 'JPY') {
    return Math.round(targetAmount);
  }
  return Number(targetAmount.toFixed(2));
}
