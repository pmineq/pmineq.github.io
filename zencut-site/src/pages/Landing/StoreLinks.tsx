import { storeGuide } from './storeGuide';
import { detectOS, storeDestination } from './storeRouting';
import type { StoreCountry } from './storeRouting';
import { formatStorePrice } from './prices';
import type { Locale } from './locale';
import type { Copy } from './translations';



export default function StoreLinks({ locale, country, copy, onChoose }: {
  locale?: Locale; country?: StoreCountry; copy?: Copy; onChoose?: () => void;
}) {
  const os = detectOS(navigator);
  const stores = storeDestination(navigator.language, country);
  const guide = storeGuide[stores.locale];
  const order = os === 'android' ? ['android', 'ios'] as const : ['ios', 'android'] as const;
  return <div className={`store-links smart-store-links device-${os}`} data-device={os}>
    {order.map(platform => <a key={platform}
      className={`store-button ${platform} ${os === platform ? 'is-primary' : ''}`}
      data-store={platform} href={stores[platform]} target="_top" onClick={onChoose}>
      {platform === 'ios' ? <svg viewBox="0 0 24 28" fill="currentColor" aria-hidden="true"><path d="M16 5c1-1.2 1.6-2.8 1.4-4.3-1.5.1-3.2 1-4.2 2.2-1 1-1.7 2.6-1.5 4.1 1.6.1 3.2-.8 4.3-2ZM20.4 15.1c0-3 2.4-4.4 2.5-4.5-1.4-2.1-3.6-2.4-4.4-2.4-1.9-.2-3.7 1.1-4.7 1.1s-2.5-1.1-4.1-1.1c-2.1 0-4 1.3-5.1 3.1-2.2 3.7-.6 9.2 1.5 12.2 1 1.5 2.2 3.1 3.8 3 1.5-.1 2.1-1 4-1s2.5 1 4.1 1c1.7 0 2.7-1.5 3.7-3 1.2-1.7 1.7-3.4 1.7-3.5-.1 0-3-1.2-3-4.9Z"/></svg> :
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3 20 12 5 21V3Z" stroke="currentColor" strokeWidth="1.5"/><path d="m5 3 10 14M5 21 15 7" stroke="currentColor" strokeWidth="1.5"/></svg>}
      <span><small>{copy ? (platform === 'ios' ? copy.iosDownload : copy.androidDownload) : guide.download}</small>
        {platform === 'ios' ? 'App Store' : 'Google Play'}
        {locale && <strong className="store-price">{formatStorePrice(stores.country, platform, locale)}</strong>}
      </span><span className="store-arrow" aria-hidden="true">↗</span>
    </a>)}
  </div>;
}
