import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

// GitHub Pages requires physical entries; asset URLs retain the /zencut/ base.
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
await mkdir(new URL('../dist/camera/', import.meta.url), { recursive: true });
await copyFile(new URL('../dist/index.html', import.meta.url), new URL('../dist/camera/index.html', import.meta.url));
await mkdir(new URL('../dist/apps/zencut/go/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/apps/zencut/index.html', import.meta.url), html);
const fallback = `<noscript><main style="font-family:system-ui;text-align:center;padding:48px 20px;color:#402331;background:#fff1fa"><h1>Zencut</h1><p>기기에 맞는 스토어를 선택해 주세요.<br>Choose the store for your device.</p><p><a target="_top" href="https://apps.apple.com/us/app/zencut/id6816699757">App Store ↗</a> &nbsp; <a target="_top" href="https://play.google.com/store/apps/details?id=com.pmineq.zencut&amp;hl=en&amp;gl=US">Google Play ↗</a></p><a href="/apps/zencut/">Zencut</a></main></noscript>`;
await writeFile(new URL('../dist/apps/zencut/go/index.html', import.meta.url), html.replace('<title>ZENCUT</title>', '<title>Zencut · App Store / Google Play</title><meta name="robots" content="noindex">').replace('<div id="root"></div>', `<div id="root"></div>${fallback}`));
