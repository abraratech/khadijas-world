# Applying the ART.1B Update

Extract the update ZIP over the source repository:

```text
C:\Projects\khadijas-world
```

Do not extract into `C:\wamp64\www` and do not edit the deployed copy directly.

Then run:

```powershell
cd C:\Projects\khadijas-world
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

Hard-refresh:

```text
http://localhost/khadijas-world/
```

Check `docs/ART1B_HOME_AND_ITEMS.md` for the manual regression list.
