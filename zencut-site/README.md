# Zencut landing and smart store routing

Maintained React source for `/zencut/`, `/apps/zencut/`, and `/apps/zencut/go/`. Imported from the existing Zencut web project so store behavior can be changed in source rather than patched in generated bundles. The original camera remains at `/zencut/camera/`.

```sh
npm ci
npm test
npm run lint
npx tsc -b
npm run site:prepare
```

`site:prepare` builds and overlays only Zencut assets and physical HTML entries into the parent GitHub Pages repository. It preserves support/privacy pages, other products, and old hashed assets needed by cached HTML. Commit the source and generated files together and push through the existing Pages branch.

`src/pages/Landing/storeRouting.ts` owns OS detection, browser-language storefront defaults, and the 1200 ms redirect. `StoreLinks.tsx` renders ordinary HTTPS anchors with `target="_top"`, ordered and highlighted by OS. `StoreGo.tsx` keeps those anchors visible when automatic navigation is blocked. Desktop visitors choose between both stores. A noscript fallback is included on the go route.

Initial store region is based on `navigator.language`, independent of saved language or country. The landing page's explicit country picker can change the region for the current visit. Instagram/Threads can require a user gesture to open a native store; the visible anchors provide that fallback. Native app hand-off remains controlled by the host browser and OS.

The existing price snapshot is sourced from official store listings; `npm run prices:update` refreshes it. No conversion-based prices or new product claims were added.
