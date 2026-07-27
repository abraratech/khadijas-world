# Apply ART.1K-C — Production Prop and Interaction Alignment

## Apply

From PowerShell:

```powershell
cd C:\Projects\khadijas-world

$Zip = "$env:USERPROFILE\Downloads\art1k-c-prop-interaction-alignment.zip"
$Extracted = "$env:TEMP\art1k-c-prop-interaction-alignment"

Remove-Item $Extracted -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Extracted -Force

& "$Extracted\apply-art1k-c.ps1" `
  -ProjectRoot "C:\Projects\khadijas-world"
```

The script requires the `art-1k-c-prop-interaction-alignment` branch unless
`-Force` is explicitly supplied. It validates every runtime replacement before
writing project files and creates a backup under the Windows temporary folder.

## Validate

```powershell
cd C:\Projects\khadijas-world

npm run validate:assets
npm run check
npm test -- --run `
  src/game/items/productionItemVisuals.test.ts `
  src/game/gameSystems.test.ts
npm run build
```

The pre-existing `createWorldPlaque.test.ts` tests may still fail in the Node
test environment when `OffscreenCanvas` is unavailable. That issue is unrelated
to ART.1K-C; the production build should continue to pass.

## Visual review

Run:

```powershell
npm run dev
```

Open `http://localhost:5173` and hard-refresh.

Check:

- Cups, apples, cupcakes, sandwiches, shopping bags, and toy blocks use the
  right-hand anchor.
- Teddy, book, tray, dishes, backpack, basket, shopping basket, and picnic
  basket stay centered in front of the torso.
- The little sister receives smaller props than Khadija and her brother.
- Adult NPCs receive slightly larger props.
- Books tilt into a readable pose instead of rotating around one wrist.
- Trays and baskets remain level while walking.
- Giving an item to a sibling clears the giver's arm pose.
- Giving an item to an NPC and taking it back clears both prior poses.
- Dropping an item restores normal arm movement.
- A portable container cannot be placed inside another portable container.
- The serving tray accepts food, drinks, and dishes but rejects bulky toys.
- The toy box accepts teddy and toy block only.
- Held items restore correctly after save and reload.

## Commit

Remove the temporary source-review bundle if it remains untracked:

```powershell
Remove-Item ART1K_C_SOURCE_REVIEW.txt -ErrorAction SilentlyContinue
```

Then:

```powershell
git status
git add -A
git commit -m "feat: align production props and interactions ART.1K-C"
```
