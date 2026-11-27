export type DeviceOS = 'ios' | 'android' | 'other';
export type StoreCountry = 'kr' | 'jp' | 'th' | 'tw' | 'us' | 'au' | 'ca' | 'gb';
export type StoreLanguage = 'ko' | 'ja' | 'th' | 'zh-Hant' | 'en';

type BrowserDevice = { userAgent?: string; platform?: string; maxTouchPoints?: number };

export function detectOS({ userAgent = '', platform = '', maxTouchPoints = 0 }: BrowserDevice): DeviceOS {
  if (/iPhone|iPad|iPod/i.test(`${userAgent} ${platform}`) ||
      (/Mac/i.test(`${userAgent} ${platform}`) && maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(`${userAgent} ${platform}`)) return 'android';
  return 'other';
}

export function storeDestination(language = '', selectedCountry?: StoreCountry) {
  const parts = language.toLowerCase().replaceAll('_', '-').split('-');
  const traditional = parts[0] === 'zh' && parts.some(part => ['tw', 'hk', 'hant'].includes(part));
  const locale: StoreLanguage = traditional ? 'zh-Hant' :
    parts[0] === 'ko' ? 'ko' : parts[0] === 'ja' ? 'ja' : parts[0] === 'th' ? 'th' : 'en';
  const defaults: Record<StoreLanguage, StoreCountry> = { ko:'kr', ja:'jp', th:'th', 'zh-Hant':'tw', en:'us' };
  const country = selectedCountry ?? defaults[locale];
  const hl = locale === 'zh-Hant' ? 'zh_TW' : locale;
  return {
    country, locale,
    ios: `https://apps.apple.com/${country}/app/zencut/id6816699757${locale === 'th' && country === 'th' ? '?l=th' : ''}`,
    android: `https://play.google.com/store/apps/details?id=com.pmineq.zencut&hl=${hl}&gl=${country.toUpperCase()}`,
  };
}

export function scheduleStoreRedirect(os: DeviceOS, stores: {ios: string; android: string}, navigate: (url: string) => void) {
  if (os === 'other') return () => {};
  const timer = setTimeout(() => navigate(stores[os]), 1200);
  return () => clearTimeout(timer);
}
