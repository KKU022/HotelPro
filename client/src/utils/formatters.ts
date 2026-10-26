/**
 * HotelPro Currency, Date & Time Formatting Utilities
 * Default Currency: INR (Indian Rupee ₹)
 * Default Locale: en-IN (or hi-IN)
 * Default Timezone: Asia/Kolkata (IST)
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  label: string;
  rateToInr: number; // 1 unit in INR
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)', rateToInr: 1.0 },
  { code: 'USD', symbol: '$', label: 'USD ($)', rateToInr: 86.50 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', rateToInr: 93.20 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', rateToInr: 111.40 },
  { code: 'AED', symbol: 'د.إ', label: 'AED (د.إ)', rateToInr: 23.55 },
];

export const EXCHANGE_RATE_LAST_UPDATED = 'October 2026 Reference Snapshot';

/**
 * Convert price from base currency to display currency
 */
export function convertPrice(amount: number, fromCurrency = 'INR', targetCurrency = 'INR'): number {
  const from = fromCurrency.toUpperCase();
  const target = targetCurrency.toUpperCase();

  if (from === target) return amount;

  const fromConfig = SUPPORTED_CURRENCIES.find((c) => c.code === from);
  const targetConfig = SUPPORTED_CURRENCIES.find((c) => c.code === target);

  if (!fromConfig || !targetConfig) return amount;

  // Convert to INR base, then to target
  const inrAmount = amount * fromConfig.rateToInr;
  const targetAmount = inrAmount / targetConfig.rateToInr;

  if (target === 'INR') {
    return Math.round(targetAmount);
  }
  return Number(targetAmount.toFixed(2));
}

/**
 * Format currency with Indian or International standard formatting
 */
export function formatCurrency(
  amount: number,
  currencyCode = 'INR',
  options: { maximumFractionDigits?: number } = {}
): string {
  const code = currencyCode.toUpperCase();
  const maxDigits = options.maximumFractionDigits !== undefined ? options.maximumFractionDigits : (code === 'INR' ? 0 : 2);

  try {
    const locale = code === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: maxDigits,
      minimumFractionDigits: code === 'INR' ? 0 : 2,
    }).format(amount);
  } catch {
    const config = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    const sym = config ? config.symbol : code;
    return `${sym} ${amount.toLocaleString('en-IN')}`;
  }
}

/**
 * Helper to display converted price with estimate indicator if currencies differ
 */
export function displayPriceWithEstimate(
  amount: number,
  baseCurrency = 'INR',
  displayCurrency = 'INR'
): { formatted: string; isConverted: boolean; originalFormatted: string } {
  const isConverted = baseCurrency.toUpperCase() !== displayCurrency.toUpperCase();
  const convertedVal = convertPrice(amount, baseCurrency, displayCurrency);
  const formatted = formatCurrency(convertedVal, displayCurrency);
  const originalFormatted = formatCurrency(amount, baseCurrency);

  return { formatted, isConverted, originalFormatted };
}

/**
 * Locale and Timezone aware Date Formatter (Defaults to IST Asia/Kolkata)
 */
export function formatDate(
  dateInput: string | Date,
  lang: 'en' | 'hi' = 'en',
  timeZone = 'Asia/Kolkata',
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!dateInput) return '';

  // Handle date-only strings 'YYYY-MM-DD' without UTC backward shifts
  let dateObj: Date;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-').map(Number);
    dateObj = new Date(year, month - 1, day, 12, 0, 0); // Noon anchor
  } else {
    dateObj = new Date(dateInput);
  }

  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone,
    ...options,
  };

  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch {
    return dateObj.toDateString();
  }
}

/**
 * Format time with timezone awareness (Defaults to IST)
 */
export function formatTime(
  dateInput: string | Date,
  timeZone = 'Asia/Kolkata'
): string {
  if (!dateInput) return '';
  const dateObj = new Date(dateInput);
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone,
    }).format(dateObj);
  } catch {
    return '';
  }
}
