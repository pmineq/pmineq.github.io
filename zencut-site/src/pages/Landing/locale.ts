export const locales = ['ko', 'en', 'ja', 'th', 'zh-Hans', 'zh-Hant'] as const;
export type Locale = typeof locales[number];
export const languageNames: Record<Locale, string> = {
  ko: '한국어', en: 'English', ja: '日本語', th: 'ไทย', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文',
};
const supported = (value?: string | null): value is Locale => locales.includes(value as Locale);

export function resolveLocale({ query, saved, languages = [] }: {
  query?: string | null; saved?: string | null; languages?: readonly string[];
}): Locale {
  if (supported(query)) return query;
  if (supported(saved)) return saved;
  for (const tag of languages) {
    const parts = tag.toLowerCase().split(/[-_]/);
    if (parts[0] === 'zh') {
      if (parts.includes('hans')) return 'zh-Hans';
      if (parts.includes('hant')) return 'zh-Hant';
      return parts.some(p => ['tw', 'hk', 'mo'].includes(p)) ? 'zh-Hant' : 'zh-Hans';
    }
    if (supported(parts[0])) return parts[0];
  }
  return 'en';
}

export function initialLocale(): Locale {
  let saved: string | null = null;
  try { saved = localStorage.getItem('zencut.language'); } catch { /* Private in-app browsers may block storage. */ }
  return resolveLocale({ query: new URLSearchParams(location.search).get('lang'), saved, languages: navigator.languages });
}
