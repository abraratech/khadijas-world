# Apply ART.1A update

This package is intended for the approved ARCHITECTURE.1 source repository at
`C:\Projects\khadijas-world`. Do not extract it into the WAMP deployment folder.

## Steps

1. Commit or back up the current clean `main` branch.
2. Extract the update ZIP over `C:\Projects\khadijas-world`, preserving paths.
3. Open PowerShell in the source repository and run:

```powershell
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

`npm install` is required because ART.1A adds `@babylonjs/loaders` for GLB loading
and will normalize `package-lock.json` on the development machine.

4. Open `http://localhost/khadijas-world/`, hard-refresh, and complete the ART.1A
section in `docs/REGRESSION_CHECKLIST.md`.
5. Do not merge/tag as full ART.1 until physical performance and visual alignment
are approved. A suitable contained commit name is:

```text
ART.1A - integrate single playable Khadija production asset
```
