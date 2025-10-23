// Union of common currencies for autocompletion
export type CommonCurrency =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "CAD";

// Combine with string to allow any other ISO 4217 code if needed
export type CurrencyCode = CommonCurrency | (string & {});

interface FormatCurrencyOptions {
  currency?: CurrencyCode;
  compact?: boolean;
  showSymbol?: boolean;
  decimals?: number;
  locale?: string; // optional override
}

export function formatCurrency(
  amount: number | string,
  options: FormatCurrencyOptions = {}
): string {
  const {
    currency = "INR",
    compact = false,
    showSymbol = true,
    decimals = 2,
    locale = "en-IN",
  } = options;

  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) return "";

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: showSymbol ? "currency" : "decimal",
      currency: showSymbol ? currency : undefined,
      notation: compact ? "compact" : "standard",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return formatter.format(numericAmount);
  } catch {
    // Basic fallback in case Intl fails (rare)
    const formatted = numericAmount.toFixed(decimals);
    const [intPart, decPart] = formatted.split(".");
    const withCommas = intPart.replace(/\B(?=(\d{2})+(?=(\d{3})+$))/g, ",");
    return showSymbol
      ? `${currency} ${withCommas}.${decPart}`
      : `${withCommas}.${decPart}`;
  }
}

/** Format plain number (no currency) */
export function formatNumber(amount: number, decimals: number = 2): string {
  return formatCurrency(amount, { showSymbol: false, decimals });
}

/** Create preconfigured formatter */
export function createCurrencyFormatter(
  currency: CurrencyCode = "INR",
  options: Omit<FormatCurrencyOptions, "currency"> = {}
) {
  return (amount: number) => formatCurrency(amount, { ...options, currency });
}
