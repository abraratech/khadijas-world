# ART.1K Label Orientation Hotfix

The ART.1K physical play-set plaques were being viewed from the back side of
the Babylon plane. Because the material rendered both sides, the DynamicTexture
lettering appeared mirrored.

This hotfix changes the plaque defaults to:

- rotate the front face toward the fixed dollhouse camera (`Math.PI` on Y);
- generate a front-side plane instead of double-sided geometry;
- enable back-face culling so mirrored back-face text cannot render.

The fix applies to Kitchen, Fridge, Oven, Toy Box, Bedroom, Cafe, Grocery, and
Checkout plaques. Hover/touch interface labels are HTML and were not affected.
No gameplay IDs, interactions, collisions, saves, room geometry, or camera
framing are changed.
