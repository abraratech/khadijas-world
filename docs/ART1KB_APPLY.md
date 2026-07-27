# Apply ART.1K-B — Hero Procedural Cast Refinement

This update replaces three existing character files and adds ART.1K-B documentation.

## Apply

From PowerShell:

```powershell
cd C:\Projects\khadijas-world

git status
```

The branch should be:

```text
art-1k-b-hero-cast-refinement
```

Extract `art1k-b-hero-cast-refinement.zip` directly over:

```text
C:\Projects\khadijas-world
```

Allow Windows to replace the three existing files.

## Validate

```powershell
cd C:\Projects\khadijas-world

npm run check
npm test -- --run src/game/characters/heroCharacterProfiles.test.ts
npm run build
```

Then start the local build:

```powershell
npm run dev
```

Open the Vite URL and hard-refresh.

## Visual approval pass

Check the procedural cast in these locations:

- family home: Mama and the family companions
- street: Auntie Noor
- café: Ms. Sana
- park: Mr. Sami and Auntie Layla
- grocery: Mr. Kareem and Mrs. Huda

Confirm:

- hair, eyes, ears, and accessories remain attached when heads differ in size
- the little sister has a toddler silhouette without floating feet
- adult shoulders, torsos, arms, hands, and feet read differently
- non-hoodie characters no longer show the old hoodie emblem through clothing
- shoes remain grounded after leg-length changes
- expressions, walking, seating, held items, dialogue, and saves still work

## Roll back

```powershell
git restore src/game/characters/heroCharacterProfiles.ts
git restore src/game/characters/heroCharacterProfiles.test.ts
git restore src/game/characters/applyHeroCharacterPolish.ts
```
