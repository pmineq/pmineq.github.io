import type { Locale } from './locale';
import { storePrices } from './storePrices.ts';
export const countries = ['kr', 'us', 'jp', 'th', 'tw', 'au', 'ca', 'gb'] as const;
export type Country = typeof countries[number];
export type Platform = 'ios' | 'android';
const defaults: Record<Locale, Country> = { ko:'kr', en:'us', ja:'jp', th:'th', 'zh-Hans':'tw', 'zh-Hant':'tw' };
const supported = (code: string): code is Country => countries.includes(code as Country);

export function resolveCountry({ locale, query, saved, languages = [] }: {
  locale: Locale; query?: string | null; saved?: string | null; languages?: readonly string[];
}): Country {
  for (const candidate of [query, saved]) {
    if (candidate && supported(candidate.toLowerCase())) return candidate.toLowerCase() as Country;
  }
  for (const tag of languages) {
    const region = tag.split(/[-_]/).slice(1).find(part => /^[a-z]{2}$/i.test(part))?.toLowerCase();
    if (region && supported(region)) return region;
  }
  return defaults[locale];
}
export function initialCountry(locale: Locale): Country {
  let saved: string | null = null;
  try { saved = localStorage.getItem('zencut.country'); } catch { /* Storage is optional. */ }
  return resolveCountry({ locale, query:new URLSearchParams(location.search).get('country'), saved, languages:navigator.languages });
}
export function priceFor(country: Country, platform: Platform) { return storePrices[country][platform]; }
export function formatStorePrice(country: Country, platform: Platform, locale: Locale): string {
  const { amount, currency } = priceFor(country, platform);
  const regionLocale = `${locale === 'zh-Hant' ? 'zh-TW' : locale === 'zh-Hans' ? 'zh-CN' : locale}`;
  return new Intl.NumberFormat(regionLocale, { style:'currency', currency }).format(amount);
}
export function countryName(country: Country, locale: Locale): string {
  return new Intl.DisplayNames([locale], { type:'region' }).of(country.toUpperCase()) ?? country.toUpperCase();
}
