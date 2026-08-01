# CLOUD.SAVE.1 — encrypted cross-device saves

Khadija's World keeps local saves as the primary, offline-first copy. A grown-up can create a high-entropy sync code in Grown-Up Controls. The browser encrypts the world with AES-GCM before sending it to Cloudflare; D1 stores only the encrypted envelope and revision metadata.

## Cloudflare resources

- Pages binding: `WORLD_SAVE_DB`
- D1 database: `khadijas-world-saves`
- Migration directory: `migrations`
- Existing KV binding `NPC_CHAT_RATE_LIMIT` is reused for bounded API request counters.

## Production migration

```powershell
npx wrangler@latest d1 migrations apply khadijas-world-saves --remote --config wrangler.jsonc
```

## Security and recovery model

- The five-part sync code is the recovery secret. There is no child account or personal profile.
- A SHA-256-derived slot identifier and access token authenticate requests.
- PBKDF2-SHA-256 derives a 256-bit AES-GCM key in the browser.
- Cloudflare does not receive plaintext world JSON or the raw sync code.
- Revision compare-and-swap prevents one device from silently overwriting newer progress.
- Local saving continues when Cloudflare is unavailable or the device is offline.
- Disconnecting preserves both the device save and the cloud copy. Deleting the cloud copy requires the connected secret.
