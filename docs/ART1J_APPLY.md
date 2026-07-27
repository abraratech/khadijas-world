# ART.1J Apply Guide

## Expected base

Apply this update after the latest ART.1I café and grocery package. The project
should already include the ART.1G camera framing, viewport mask, procedural
Mama, ART.1H bedroom, and ART.1I commercial-room updates.

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

Select High and visit Neighborhood and Park. Verify:

- the home and café façades look layered rather than flat;
- doors, windows, awning, paving, curbs, gardens, lamps, signs, bench, and
  mailbox remain inside the dollhouse mask;
- street leaves, flowers, awning, signs, and light movement are restrained;
- the park has clearer boundaries, path depth, planting, seating, picnic,
  playground, pond, fountain, and foreground/background separation;
- park leaves, bunting, swings, fountain droplets, and lily pads move gently;
- home/café/park/grocery travel still works;
- the mailbox and scooter still work;
- street and park NPC chat and item handovers still work;
- all park benches, picnic, slide, swings, sandbox, flowers, birds, fountain,
  sign, bin, basket, watering can, and camera still work;
- Low graphics removes the ART.1J layers;
- returning to either location does not duplicate visual details.

## Rollback

Restore the ART.1I source or revert the ART.1J commit. No save migration is
required because ART.1J adds no persistent identifiers.
