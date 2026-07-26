# ART.1H — Bedroom Art Direction

ART.1H applies the family-home benchmark to Khadija's bedroom while preserving
all existing gameplay proxies.

## Visual hierarchy

1. **Bed suite:** upholstered headboard, rounded frame, mattress, duvet, layered
   pillows, bedside storage, bedtime book, and night light.
2. **Study area:** rounded desk, drawer pedestal, chair cushioning, notebook,
   pencil, and desk lamp.
3. **Storage wall:** framed wardrobe doors, handles, crown, cubbies, books, and a
   floor plant.
4. **Personal story:** framed artwork, fairy lights, reading chair, hanging
   mobile, laundry basket, slippers, and window plants.
5. **Architecture:** crown moulding, baseboards, picture rail, shallow wall
   panels, deeper window trim, and an outside sky vignette.

## Quality policy

The complete ART.1H pass is visual-only and registered with the existing
`decorativeDetails` quality switch. High shows the complete pass. Low and
Adaptive can disable it without altering collisions, seats, hotspots, saves, or
room ownership.

## Motion policy

High uses only inexpensive transform and alpha changes:

- curtain sway;
- plant-leaf movement;
- slow hanging-mobile rotation;
- gentle fairy-light and night-light pulse.

No dynamic physics, particle system, extra real-time light, PBR pipeline, or
post-processing effect is introduced.
