# ART.1I Café and Grocery Art Direction

## Goal

Make Sunny Café and Sunny Basket Grocery feel like finished toy-world sets on
High while preserving the inexpensive gameplay geometry underneath.

## Sunny Café

The dedicated High layer adds:

- architectural crown trim, picture rail, wall panels, and deeper window trim;
- a branded café plaque and community notice board;
- layered counter fascia, cabinet panels, kick rail, backsplash, and cup shelf;
- a refined coffee machine with screen, spouts, cups, drip tray, and steam;
- a layered pastry display with glass shelves and varied pastries;
- rounded café tables, pedestal bases, chairs, flowers, and contact shadows;
- a more intentional toy corner for younger-family stories.

The existing bell, menu board, coffee hotspot, pastry hotspot, seats, cupcake,
and sandwich remain the gameplay authority.

## Grocery

The dedicated High layer adds:

- architectural trim, a stronger main sign, and suspended aisle wayfinding;
- rounded aisle shelving with price strips, cartons, tins, and labels;
- layered produce crates with fruit and vegetable clusters;
- a bakery counter with shelves, loaves, and striped canopy;
- a framed refrigerated display with internal shelves, bottles, and cool light;
- a stocked household section;
- a layered checkout with conveyor grooves, register, receipt, bag rack, and
  illuminated lane marker;
- contact shadows beneath the main commercial fixtures.

The existing grocery products, basket, reusable bag, checkout logic, stock
hotspot, and exit remain authoritative.

## Motion policy

High adds only restrained motion:

- café steam rises and fades;
- notice cards move almost imperceptibly;
- grocery aisle signs sway slightly;
- produce mist rises slowly;
- fridge and checkout light materials pulse subtly.

All animation loops pause when the corresponding detail meshes are disabled.

## Quality separation

ART.1I meshes are tagged as High decorative details and are non-pickable. Low
and Adaptive can disable them without changing walkability, collision, NPCs,
items, dialogue, seats, travel, or save state.
