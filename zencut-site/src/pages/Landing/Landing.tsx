import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initialLocale, languageNames, locales } from './locale';
import type { Locale } from './locale';
import { messages } from './translations';
import { countries, formatStorePrice, countryName } from './prices';
import type { Country } from './prices';
import { pricesCheckedAt } from './storePrices';
import { pricingMessages } from './pricingTranslations';
import './Landing.css';
import './StoreGo.css';
import StoreLinks from './StoreLinks';
import { storeDestination } from './storeRouting';

const asset = (name: string) => `${import.meta.env.BASE_URL}landing/${name}`;
const frames = [
  { key: 'strawberry', file: 'strawberry' },
  { key: 'pastry', file: 'bungeoppang' },
  { key: 'pink', file: 'pink' },
  { key: 'check', file: 'check' },
] as const;

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const printSection = useRef<HTMLElement>(null);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [country, setCountry] = useState<Country>(() => storeDestination(navigator.language).country);
  const [mode, setMode] = useState<'photo' | 'moving'>('photo');
  const [frame, setFrame] = useState(0);
  const reduced = useReducedMotion();
  const t = messages[locale];
  const pt = pricingMessages[locale];

  function changeLanguage(value: string) {
    if (!locales.includes(value as Locale)) return;
    setLocale(value as Locale);
    try { localStorage.setItem('zencut.language', value); } catch { /* Storage is optional. */ }
    const url = new URL(location.href);
    url.searchParams.set('lang', value);
    history.replaceState(null, '', url);
  }

  function changeCountry(value: string) {
    if (!countries.includes(value as Country)) return;
    setCountry(value as Country);
    try { localStorage.setItem('zencut.country', value); } catch { /* Storage is optional. */ }
    const url = new URL(location.href);
    url.searchParams.set('country', value);
    history.replaceState(null, '', url);
  }

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t.pageTitle;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDescription);
    // Different scripts and text lengths change the print section's measurements.
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(refresh);
  }, [locale, t]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.print-paper', { yPercent: -84 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: printSection.current, start: 'top 75%', end: 'bottom 85%', scrub: 0.5 },
      });
    }, root);
    return () => mm.revert();
  }, []);

  return <MotionConfig reducedMotion="user"><div className="zencut-landing" ref={root} lang={locale}>
    <a className="skip-link" href="#main">{t.skip}</a>
    <header className="zc-nav">
      <a className="studio-wordmark" href="#main">ZENCUT<span>POCKET PHOTO BOOTH</span></a>
      <div className="nav-controls">
        <nav aria-label={t.navLabel}>
          <a href="#experience">{t.navExperience}</a>
          <a href="#frames">{t.navFrames}</a>
          <a className="nav-download" href="#download">{t.navDownload}</a>
        </nav>
        <div className="language-picker">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>
          <select aria-label={`${t.language} / Language`} value={locale} onChange={event => changeLanguage(event.target.value)}>
            {locales.map(code => <option key={code} value={code} lang={code}>{languageNames[code]}</option>)}
          </select>
        </div>
      </div>
    </header>
    <main id="main">
      <section className="zc-hero">
        <div className="hero-heading">
          <p className="eyebrow">A LITTLE CAMERA. A LOT OF US.</p>
          <h1>{t.heroTitle}<br/><em>{t.heroAccent}</em></h1>
          <p className="hero-description localized-lines">{t.heroDescription}</p>
          <StoreLinks locale={locale} country={country} copy={t}/>
          <p className="purchase-note">{t.purchaseNote}</p><a className="store-country-hint" href="#download">{pt.country}: {countryName(country, locale)}</a>
          <a className="scroll-note" href="#experience">{t.scrollNote}<span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-object">
          <div className="hero-orbit" aria-hidden="true"/>
          <span className="handwritten hero-note">{t.heroNote}</span>
          <motion.div className="camera-crop" initial={reduced ? false : { y: 20, rotate: 1, opacity: 0 }} animate={{ y: 0, rotate: -3, opacity: 1 }} transition={{ duration: .8 }}>
            <img src={asset('hero.jpg')} alt={t.heroAlt} width="900" height="1955" fetchPriority="high"/>
          </motion.div>
          <span className="camera-tag">ZENCUT / POCKET PHOTO BOOTH</span>
        </div>
        <div className="hero-bottom"><span>MADE FOR YOUR EVERYDAY MOMENTS</span><span>PHOTO + MOVING CUT</span></div>
        <p className="screenshot-note">{t.screenshotNote}</p>
      </section>

      <section className="capture-section section-wrap" id="experience" aria-labelledby="capture-title">
        <div className="section-copy">
          <p className="eyebrow">TWO WAYS TO KEEP A MOMENT</p>
          <h2 id="capture-title">{t.captureTitle}<br/><em>{t.captureAccent}</em></h2>
          <p className="localized-lines">{t.captureDescription}</p>
          <p className="muted localized-lines">{t.captureMore}</p>
        </div>
        <div className="capture-demo">
          <div className="mode-tabs" role="group" aria-label={t.modesLabel}>
            <button aria-pressed={mode === 'photo'} onClick={() => setMode('photo')}>{t.photoTab}</button>
            <button aria-pressed={mode === 'moving'} onClick={() => setMode('moving')}>{t.movingTab}</button>
          </div>
          <div className="preview-window">
            <motion.img key={mode} src={asset(mode === 'photo' ? 'hero.jpg' : 'moving.jpg')} alt={mode === 'photo' ? t.photoAlt : t.movingAlt} width="900" height="1955" loading="lazy" initial={{ opacity: .5 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .2 }}/>
            <motion.div key={`progress-${mode}`} className="capture-progress" aria-hidden="true" initial={{ scaleX: 0 }} animate={{ scaleX: mode === 'moving' ? 1 : 0 }} transition={{ duration: reduced ? 0 : 5, ease: 'linear' }}/>
            <div className="preview-status" aria-live="polite">{mode === 'photo' ? t.photoStatus : t.movingStatus}</div>
          </div>
          <div className="demo-footer">
            <motion.span className={`shutter ${mode}`} animate={mode === 'moving' && !reduced ? { scale: [1, .93, 1] } : { scale: 1 }} transition={{ duration: .5 }} aria-hidden="true">♡</motion.span>
            <p>{mode === 'photo' ? t.photoHelp : t.movingHelp}<small>{t.previewNote}</small></p>
          </div>
        </div>
      </section>

      <section className="print-section" ref={printSection} aria-labelledby="print-title">
        <div className="print-layout section-wrap">
          <div className="print-copy">
            <p className="eyebrow">YOUR MOMENTS, ALL IN ONE STRIP</p>
            <h2 id="print-title">{t.printTitle}<br/>{t.printLine}<em>{t.printAccent}</em></h2>
            <p className="localized-lines">{t.storyDescription}</p>
            <div className="cut-counts" aria-label={t.cutLabel}><span>1 CUT</span><span>2 CUTS</span><span>4 CUTS</span></div>
            <p className="muted localized-lines">{t.printDescription}</p>
          </div>
          <div className="printer">
            <div className="printer-head"><span>ZENCUT</span><span>MEMORY PRINTER</span></div>
            <div className="printer-slot"/>
            <div className="paper-viewport"><div className="print-paper">
              <div className="strip-header">OUR LITTLE MOMENTS</div>
              {[0,1,2,3].map(i => <div key={i} className={`strip-shot shot-${i}`} role="img" aria-label={`${t.stripAlt} ${i + 1}`}/>)}
              <p>{t.stripCaption}</p><small>2026.11.19 · ZENCUT</small>
            </div></div>
            <span className="handwritten print-note">{t.printNote}</span>
          </div>
        </div>
      </section>

      <section className="frames-section section-wrap" id="frames" aria-labelledby="frames-title">
        <div className="frames-heading">
          <div><p className="eyebrow">A FRAME THAT FEELS LIKE YOU</p><h2 id="frames-title">{t.frameTitle}<br/><em>{t.frameAccent}</em></h2></div>
          <p className="localized-lines">{t.framesDescription}</p>
        </div>
        <div className="frames-workspace">
          <div className="frame-sampler">
            <div className="frame-preview"><img src={asset(`${frames[frame].file}.webp`)} alt={t.frameOriginal.replace('{name}', t[frames[frame].key])} loading="lazy" width="900" height="1600"/></div>
            <div className="frame-options" role="group" aria-label={t.frameLabel}>
              {frames.map((f,i) => <button key={f.file} aria-pressed={frame === i} onClick={() => setFrame(i)}>{t[f.key]}</button>)}
            </div>
            <p className="small-note">{t.frameHint}</p>
          </div>
          <figure className="custom-frame">
            <img src={asset('custom.jpg')} alt={t.customAlt} width="900" height="1955" loading="lazy"/>
            <figcaption><strong>{t.customTitle}</strong><p className="localized-lines">{t.customDescription}</p></figcaption>
          </figure>
        </div>
      </section>

      <section className="details-section section-wrap" aria-labelledby="details-title">
        <p className="eyebrow">THE LITTLE THINGS MAKE THE PICTURE</p>
        <h2 id="details-title">{t.detailsTitle}<br/><em>{t.detailsAccent}</em></h2>
        <div className="detail-rows">
          <article><h3>{t.filterTitle}</h3><p className="localized-lines">{t.filterDescription}</p><span className="detail-mark" aria-hidden="true">◐</span></article>
          <article><h3>{t.timerTitle}</h3><p className="localized-lines">{t.timerDescription}</p><span className="detail-mark" aria-hidden="true">◷</span></article>
          <article><h3>{t.saveTitle}</h3><p className="localized-lines">{t.saveDescription}</p><span className="detail-mark" aria-hidden="true">♡</span></article>
        </div>
      </section>

      <section className="download-section" id="download" aria-labelledby="download-title">
        <p className="eyebrow">A PHOTO BOOTH, ALWAYS WITH YOU</p>
        <h2 id="download-title">{t.downloadTitle}<br/><em>{t.downloadAccent}</em></h2>
        <p>{t.downloadDescription}</p><StoreLinks locale={locale} country={country} copy={t}/>
        <label className="country-picker">
          <span>{pt.country}</span>
          <span className="country-select"><select value={country} onChange={event => changeCountry(event.target.value)}>
            {countries.map(code => <option key={code} value={code}>{countryName(code, locale)}</option>)}
          </select></span>
        </label>
        <div className="prices-grid" aria-live="polite">
          <div><span>App Store · iOS</span><strong>{formatStorePrice(country, 'ios', locale)}</strong></div>
          <div><span>Google Play · Android</span><strong>{formatStorePrice(country, 'android', locale)}</strong></div>
        </div>
        <p className="price-purchase-note">{t.priceNote}</p>
        <p className="price-region">{pt.verified}: {pricesCheckedAt}<br/>{pt.storeNote}</p>
        <ul className="policy-list"><li>{t.ads}</li><li>{t.subscription}</li><li>{t.iap}</li><li>{t.login}</li></ul>
        <p className="device-note">{t.deviceNote}</p>
      </section>
    </main>
    <footer className="zc-footer">
      <a className="studio-wordmark" href="https://zenco.top/">ZENCO<span>{t.studioTag}</span></a>
      <div><a href="mailto:contact@zenco.top">contact@zenco.top</a><a href="/zencut/privacy.html">{t.privacy}</a></div>
      <p>© {new Date().getFullYear()} ZENCO · Zencut</p>
    </footer>
  </div></MotionConfig>;
}
