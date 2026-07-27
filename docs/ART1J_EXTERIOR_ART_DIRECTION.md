# ART.1J Neighborhood and Park Art Direction

## Goal

Make both outdoor locations feel like finished miniature toy-world sets on High
without changing the gameplay geometry that already controls walking, travel,
seats, activities, NPCs, items, or saves.

## Neighborhood

The dedicated High layer adds:

- a finished family-home façade with stone base, cornice, corner blocks, framed
  door, deeper window, planter, steps, and garden edge;
- a finished Sunny Café façade with tiled plinth, branded sign, framed door,
  deeper display window, striped awning, and window plants;
- layered curbs, paving stones, road seams, lane markings, and a small bicycle
  marking to improve scale and street readability;
- a planted tree ring, layered tree crown, flower bed, picket garden edge, and
  additional seasonal color;
- a refined bench, mailbox shell, direction signs, street lamps, warm light
  pools, and a small pavement café table;
- contact depth beneath the main street furniture.

The existing home/café doors, park/grocery gates, mailbox action, scooter,
street bench, NPC, walkable meshes, placement targets, and save state remain the
gameplay authority.

## Park

The dedicated High layer adds:

- background hedges, layered tree canopies, flower borders, planters, and grass
  tufts to create foreground/background separation;
- rounded path pavers and curb edges over the existing walkable paths;
- refined wooden benches with slats, supports, and curved arms;
- a patterned picnic blanket, table details, basket, thermos, food, and bunting;
- a more complete slide with rails, ladder, landing pad, and side pieces;
- a stronger swing frame, ropes, seats, sandbox rim, sand, bucket, and spade;
- a layered stone pond with water, rim stones, lily pads, flowers, and a rebuilt
  fountain with animated droplets;
- a finished signboard, waste station, bird feeder, birds, and additional
  flower planters;
- contact depth beneath benches, picnic, playground, pond, fountain, and trees.

The existing park benches, picnic hotspot, slide, swings, sandbox, flowers,
birds, fountain, sign, bin, draggable basket, watering can, camera, exit, NPCs,
and save state remain authoritative.

## Motion policy

High adds only restrained movement:

- leaves and flowers move gently;
- café awning panels and direction signs shift almost imperceptibly;
- picnic bunting moves softly;
- swing seats move through a very small idle arc;
- fountain droplets rise and fall;
- lily pads rotate slightly;
- lamp and water materials pulse subtly.

Animation loops pause whenever the corresponding High detail layer is disabled.
Reduced-motion behavior remains controlled by the existing project settings and
will receive its final cross-system audit in ART.1M and ART.1N.

## Quality separation

Every ART.1J mesh is tagged as a non-pickable High decorative detail. Low and
Adaptive can hide the exterior layers without changing collision, walkability,
travel, seats, NPC logic, dialogue, items, activities, or saves.

## External asset policy

No third-party exterior object is active. The uploaded Ultimate House Interior
Pack remains a source/reference library. Its plants and lights may be compared
later, but only an individual object that clearly improves the approved
procedural exterior without harming performance should be accepted.
