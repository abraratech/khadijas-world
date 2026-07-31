# Khadija's World â€” Cloudflare Pages

This repository is configured for Cloudflare Pages Git deployment.

## Cloudflare Pages project settings

- Project name: `khadijas-world`
- Production branch for the current preview: `scene-1-home-environment-overhaul`
- Framework preset: `Vite` or `None`
- Build command: `npm run build:cloudflare`
- Build output directory: `dist`
- Root directory: leave blank
- Node version: pinned by `.node-version`

Every push to the connected production branch triggers a production deployment.
Other pushed branches receive preview deployments.

After this feature branch is merged, change the Pages production branch to `main`.

## Local builds

- WAMP/subfolder build: `npm run build`
- Cloudflare/root-domain build: `npm run build:cloudflare`

Cloudflare Pages hosts the static game and synchronizes deployments from Git.
Cross-device player-save synchronization is a separate backend feature and
would require a Worker or Pages Function with storage such as D1 or KV.
