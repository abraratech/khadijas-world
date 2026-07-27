# ART.1A Character Scale Hotfix

Apply this update over the ART.1A project source at:

```text
C:\Projects\khadijas-world
```

Do not extract it directly into the WAMP deployment folder.

The hotfix changes Khadija's production visual scale from `123` to `1.23`.
The Meshy mesh is approximately 1.7 units tall when Babylon renders the skinned
asset, so the corrected multiplier produces an approximately 2.1-unit character.

After applying, run:

```powershell
cd C:\Projects\khadijas-world
npm test
npm run build
npm run deploy:wamp
```

Then hard-refresh:

```text
http://localhost/khadijas-world/
```

If the model is still slightly too tall or short, adjust only
`KHADIJA_PRODUCTION_ASSET.scale` in
`src/game/assets/characterAssets.ts` in small increments such as `1.15`, `1.20`,
`1.25`, or `1.30`. Do not restore a value near `123`.
