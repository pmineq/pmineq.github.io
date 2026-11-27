import { writeFile } from 'node:fs/promises';
const countries = ['kr','us','jp','th','tw','au','ca','gb'];
async function text(url) {
  const response = await fetch(url, { signal:AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response.text();
}
const entries = await Promise.all(countries.map(async country => {
  const [lookup, html] = await Promise.all([
    text(`https://itunes.apple.com/lookup?id=6816699757&country=${country}`),
    text(`https://play.google.com/store/apps/details?id=com.pmineq.zencut&hl=en&gl=${country.toUpperCase()}`),
  ]);
  const ios = JSON.parse(lookup).results?.find(app => app.trackId === 6816699757);
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
  const app = schemas.find(item => item['@type'] === 'SoftwareApplication' && item.name === 'Zencut');
  const offer = Array.isArray(app?.offers) ? app.offers[0] : app?.offers;
  if (!ios || !offer || offer.availability !== 'https://schema.org/InStock') throw new Error(`Missing store listing for ${country}`);
  const android = { amount:Number(offer.price), currency:offer.priceCurrency };
  if (!Number.isFinite(ios.price) || !Number.isFinite(android.amount) || !ios.currency || !android.currency) throw new Error(`Invalid price for ${country}`);
  return [country, { ios:{ amount:ios.price, currency:ios.currency }, android }];
}));
// Keep the last verified snapshot if any request or parsing fails.
const output = `// Generated from official store listings. Refresh with npm run prices:update.\nexport const pricesCheckedAt = "${new Date().toISOString().slice(0,10)}";\nexport const storePrices = ${JSON.stringify(Object.fromEntries(entries),null,2)} as const;\n`;
await writeFile(new URL('../src/pages/Landing/storePrices.ts',import.meta.url),output);
console.log(`Updated actual iOS / Android prices for ${entries.length} storefronts.`);
