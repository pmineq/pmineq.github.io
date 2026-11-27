# Zencut smart store routing

User specification: browser-only OS detection (UA + platform, including touch Macs), navigator.language → ko/KR, ja/JP, th/TH, traditional Chinese/TW, otherwise en/US. On /apps/zencut/go, show a pastel instruction card and navigate once after 1200 ms on iOS/Android; desktops choose between two equally prominent store links. Keep ordinary target=_top HTTPS anchors available even if automatic navigation is blocked. Preserve the existing landing page, camera, legal pages, store pricing controls and other apps.

Implementation: maintain the existing React landing source in zencut-site, use shared store resolution and link components, and generate physical HTML entries for GitHub Pages. Automatic initial selection ignores saved pricing regions; explicit country selection remains available in the landing pricing section.

- [x] Write and run failing OS/locale URL tests.
- [x] Implement store resolution and reusable OS-aware anchor buttons.
- [x] Add the 1200 ms guide card and physical /apps/zencut/go entry with non-JS fallback.
- [x] Build and verify route timing, blocked navigation fallback, OS/language matrix, desktop choice, responsive layouts and existing tests.
- [ ] Review the exact deployment diff, publish through the existing GitHub Pages repository, and verify public routes.

Verification: 11 Node tests pass; ESLint, TypeScript and production build pass. Browser QA covered iPhone/Instagram Japanese priority, Android/Threads Thai priority and Google Play navigation, desktop store choice, traditional Chinese links, iOS blocked-navigation manual anchors, and 320px minimum-width CSS conflict. Fresh code review found no important/critical issues.
