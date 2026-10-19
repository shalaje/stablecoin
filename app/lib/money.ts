/** Concept rates and fees. Every figure on the site is a concept figure. */
export const CURRENCIES: { code: string; flag: string; name: string; perUSD: number }[] = [
  { code: "NGN", flag: "🇳🇬", name: "Nigerian naira", perUSD: 1570.084 },
  { code: "EUR", flag: "🇪🇺", name: "Euro", perUSD: 0.9218 },
  { code: "USD", flag: "🇺🇸", name: "US dollar", perUSD: 1 },
  { code: "GBP", flag: "🇬🇧", name: "British pound", perUSD: 0.7712 },
  { code: "KES", flag: "🇰🇪", name: "Kenyan shilling", perUSD: 129.35 },
  { code: "GHS", flag: "🇬🇭", name: "Ghanaian cedi", perUSD: 15.42 },
  { code: "MXN", flag: "🇲🇽", name: "Mexican peso", perUSD: 18.21 },
  { code: "BRL", flag: "🇧🇷", name: "Brazilian real", perUSD: 5.44 },
  { code: "INR", flag: "🇮🇳", name: "Indian rupee", perUSD: 84.02 },
  { code: "PHP", flag: "🇵🇭", name: "Philippine peso", perUSD: 57.8 },
  { code: "AED", flag: "🇦🇪", name: "UAE dirham", perUSD: 3.6725 },
  { code: "ZAR", flag: "🇿🇦", name: "South African rand", perUSD: 17.62 },
];
export const FEE = 0.0035; // 0.35% concept fee
export const rate = (code: string) => CURRENCIES.find((c) => c.code === code)!.perUSD;

export function quote(amount: number, from: string, to: string) {
  const fee = amount * FEE;
  const usd = (amount - fee) / rate(from);
  return { fee, usdc: usd, received: usd * rate(to), rate: rate(to) / rate(from) };
}

const fmtCache = new Map<string, Intl.NumberFormat>();
export function money(n: number, code: string, digits = 2) {
  const key = code + digits;
  if (!fmtCache.has(key)) fmtCache.set(key, new Intl.NumberFormat("en-US", { style: "currency", currency: code, minimumFractionDigits: digits, maximumFractionDigits: digits, currencyDisplay: "narrowSymbol" }));
  return fmtCache.get(key)!.format(n);
}
export const usdc = (n: number) => `${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;

/** The journey's payment: ₦15,750,000 from Lagos, €9,214.50-ish into Berlin. */
export const JOURNEY = { amount: 15750000, from: "NGN", to: "EUR", seconds: 4.2 };
