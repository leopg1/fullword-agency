/** Numele orașelor pe limbi — sursele vechi foloseau doar denumirile RO. */
const CITY_EN: Record<string, string> = {
  "București": "Bucharest",
  "Olanda": "Netherlands",
};

export function cityLabel(city: string, locale: string) {
  return locale === "en" ? (CITY_EN[city] ?? city) : city;
}
