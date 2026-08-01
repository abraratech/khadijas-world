# Khadija's World — PWA.1

PWA.1 makes the Cloudflare Pages game installable and provides offline loading.

## Build output

Both production build commands now run `scripts/build-pwa.mjs` after Vite:

- `npm run build`
- `npm run build:cloudflare`

The post-build step creates:

- `dist/sw.js`
- `dist/pwa-assets.json`
- a versioned critical shell cache
- a generated list of runtime game assets for optional/background offline download

## Offline behavior

- The app shell, JavaScript, CSS, manifest, offline page, and icons are precached.
- Same-origin game assets are cached when used.
- On normal connections, the full production asset list downloads in the background.
- On data-saver or 2G connections, the player can start the full download from Settings.
- `/api/npc-chat` and `/api/world-save` remain network-only and are never served from the asset cache.
- Local gameplay and local saves continue while offline.
- AI replies and cloud-save synchronization resume when the device reconnects.

## Updates

A newly deployed service worker waits until the player accepts the in-game update prompt. The current game session is not interrupted automatically.

## Cloudflare Pages

No additional binding is required. Keep the existing Pages settings:

- Production branch: `main`
- Build command: `npm run build:cloudflare`
- Build output directory: `dist`

## Validation

Run:

```powershell
npm run build:cloudflare
npm run pwa:check
npm run qa:browser
```

The browser suite verifies the manifest, PNG icons, service-worker control, offline shell reload, and API cache bypass.
