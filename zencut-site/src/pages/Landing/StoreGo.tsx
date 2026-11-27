import { useEffect, useState } from 'react';
import StoreLinks from './StoreLinks';
import { storeGuide } from './storeGuide';
import { detectOS, scheduleStoreRedirect, storeDestination } from './storeRouting';
import './Landing.css';
import './StoreGo.css';

export default function StoreGo() {
  const os = detectOS(navigator);
  const stores = storeDestination(navigator.language);
  const guide = storeGuide[stores.locale];
  const [attempted, setAttempted] = useState(false);
  const [manualChoice, setManualChoice] = useState(false);
  const destination = os === 'other' ? '' : stores[os];
  const storeName = os === 'ios' ? 'App Store' : 'Google Play';

  useEffect(() => {
    document.title = 'Zencut · ' + (os === 'other' ? 'App Store / Google Play' : storeName);
    document.documentElement.lang = stores.locale;
  }, [os, storeName, stores.locale]);

  useEffect(() => {
    if (manualChoice || os === 'other') return;
    let cancel = () => {};
    // Start after the guide card has painted, so slow loading never skips it.
    const frame = requestAnimationFrame(() => {
      cancel = scheduleStoreRedirect(os, { ios:destination, android:destination }, url => {
        setAttempted(true);
        // HTTPS store URLs keep the native Universal/App Link hand-off available.
        // WebViews can still require a user gesture: the anchors remain visible.
        try { (window.top ?? window).location.replace(url); }
        catch { try { window.location.replace(url); } catch { /* Use the manual anchors. */ } }
      });
    });
    const stop = () => { cancelAnimationFrame(frame); cancel(); };
    window.addEventListener('pagehide', stop, { once:true });
    return () => { stop(); window.removeEventListener('pagehide', stop); };
  }, [os, destination, manualChoice]);

  return <div className="zencut-landing store-go" lang={stores.locale}>
    <header className="go-header"><a className="studio-wordmark" href="/apps/zencut/">ZENCUT<span>POCKET PHOTO BOOTH</span></a><a href="/">ZENCO ↗</a></header>
    <main className="go-main">
      <section className="go-card" aria-labelledby="go-title">
        <div className="go-titlebar"><span>ZENCUT / DOWNLOAD</span><span aria-hidden="true">♡ ✦</span></div>
        <div className="go-card-body">
          <img className="go-icon" src="/assets/zencut/app-icon.jpg" width="512" height="512" alt="Zencut"/>
          <p className="eyebrow">YOUR POCKET PHOTO BOOTH</p>
          <h1 id="go-title">{guide.title}</h1>
          <p className="go-status" role="status">{os === 'other' ? guide.choose : attempted || manualChoice ? guide.manual : guide.opening.replace('{store}',storeName)}</p>
          {os !== 'other' && <div className={`go-progress ${attempted || manualChoice ? 'is-done' : ''}`} aria-hidden="true"><span/></div>}
          <StoreLinks onChoose={() => setManualChoice(true)}/>
          {os !== 'other' && <p className="go-help">{guide.manual}</p>}
          <a className="go-back" href="/apps/zencut/">← {guide.back}</a>
        </div>
      </section>
      <p className="go-caption">{guide.note} <span aria-hidden="true">♡</span></p>
    </main>
    <footer className="go-footer">ZENCUT · MADE BY ZENCO</footer>
  </div>;
}
