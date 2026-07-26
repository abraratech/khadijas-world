# Apply ART.1K

Extract the update over the source repository:

```text
C:\Projects\khadijas-world
```

Do not extract into the WAMP deployment folder.

Run:

```powershell
cd C:\Projects\khadijas-world
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

For Vite development:

```powershell
npm run dev
```

Open `http://localhost:5173` and hard-refresh.

## Checks

- Khadija has no ring around her feet.
- Hovering a mouse over an interactive object shows its name and action.
- Touching an interactive object briefly shows the same information.
- Khadija herself does not show a redundant hover label.
- Sister, Brother, Mama, and world NPCs show useful interaction labels.
- High shows the in-world plaques; Low hides them.
- Labels never block clicks or movement.
- Room travel, item pickup, NPC chat, seating, and saves still work.
