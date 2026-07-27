# ART.1I Apply Guide

## Expected base

Apply this update after the latest ART.1H bedroom package. The project should
already include the ART.1G camera framing, viewport mask, and procedural Mama
updates.

## Install

Extract the update over the source repository:

```text
C:\Projects\khadijas-world
```

Do not extract directly into the WAMP deployment directory.

## Validate and run

```powershell
cd C:\Projects\khadijas-world
npm install
npm run validate:assets
npm test
npm run build
npm run deploy:wamp
```

For development:

```powershell
npm run dev
```

Open the address printed by Vite, normally `http://localhost:5173`.

## Visual test

Use High graphics and visit Sunny Café and Grocery. Verify:

- richer counters, shelving, displays, stock, signs, and lighting are visible;
- café steam and grocery produce mist are subtle rather than distracting;
- all decorative objects remain inside the dollhouse mask;
- the café bell, menu, seat, coffee machine, cupcake, and sandwich still work;
- grocery products, basket, checkout, reusable bag, stock hotspot, and exit work;
- NPC chat and item handovers still work;
- Low graphics removes the ART.1I layers;
- returning to either location does not duplicate visual details.

## Rollback

Restore the ART.1H source or revert the ART.1I commit. No save migration is
required because ART.1I adds no new persistent identifiers.
