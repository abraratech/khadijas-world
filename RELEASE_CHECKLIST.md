# RELEASE.1 production checklist

Release version: **0.26.0**
Build: **content-1-neighborhood-adventures**
Date: **1 August 2026**

## Automated gate

- [ ] `npm run validate:assets`
- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run check:qa`
- [ ] `npm run build:cloudflare`
- [ ] `npm run pwa:check`
- [ ] `npm run check:bundle`
- [ ] `npm run release:check`
- [ ] Optional non-blocking emulation: `npm run release:mobile`

## Production configuration

- [ ] Cloudflare Pages production branch is `main` and output is `dist`.
- [ ] Workers AI binding `AI` is available.
- [ ] KV binding `NPC_CHAT_RATE_LIMIT` is available.
- [ ] D1 binding `WORLD_SAVE_DB` and migration are available.
- [ ] HTTPS, manifest, icons, `sw.js`, privacy page, accessibility page, and security headers load from production.

## Manual mobile and PWA checks

- [ ] iPhone Safari portrait and landscape.
- [ ] Android Chrome portrait and landscape.
- [ ] Installed PWA cold launch and update flow.
- [ ] Offline launch after downloading the offline world.
- [ ] Chat keyboard does not cover input or close controls.
- [ ] Rotate during title, settings, chat, and gameplay.

## Accessibility review

- [ ] Keyboard-only path reaches title actions, dialogs, settings, chat, and close controls.
- [ ] Focus is visible and restored after dialogs.
- [ ] Gentle motion, larger words, stronger colors, and instant dialogue persist.
- [ ] Screen-reader smoke test covers title, privacy, settings, chat, save status, and startup recovery.
- [ ] 200% browser zoom does not lose critical controls.

## Privacy and safety review

- [ ] Smarter replies remain off by default and behind the grown-up gate.
- [ ] AI limits and moderation messaging are visible.
- [ ] Cloud save clearly explains encryption and code secrecy.
- [ ] Cloud deletion and disconnect paths work.
- [ ] Public privacy notice matches the deployed implementation.
- [ ] No advertising or analytics code has been introduced.

## Release decision

- [ ] Known limitations are recorded in release notes.
- [ ] A rollback commit is identified.
- [ ] Production deployment is visually checked after Cloudflare completes.
- [ ] Release owner records **GO** or **NO-GO** with date and evidence.

## CONTENT.1 verification

- [x] Adventure Book definitions, rewards, stickers, and save normalization are present.
- [x] Existing home, bedroom, neighborhood, café, park, and grocery interactions feed typed content progress.
- [x] Dialogue suggestions cover all six locations.
- [x] Content audit, TypeScript, production build, PWA check, bundle budget, and Cloudflare Functions compile pass.
