# CONTENT.1 Accelerated

CONTENT.1 expands visual identity, room play, sound and touch feedback without
changing the lightweight dollhouse architecture introduced by PLAY.2.

## Character art

- Khadija has long layered curls, a headband and bow, flower emblem and pink shoes.
- Her little sister has two buns with colored bands, a heart emblem and purple shoes.
- Her brother has a soft cropped hairstyle, broader silhouette, star emblem and blue shoes.
- Faces now use layered eye whites, pupils, eyebrows, cheeks, noses and
  expression-specific mouth and brow poses.
- Hands, hoodie pockets, drawstrings, shoe soles and outfit details improve each
  placeholder rig while retaining low-cost primitive geometry.

## New play moments

- Home television with a saved story-time state.
- Bedroom music box with a saved glow and a bouncing toy ball.
- Neighborhood mailbox with a saved flag and cheerful letters.
- Café counter bell with a saved ring count and rotating menu specials.
- Existing furniture, items, scooter, lamps, cupboard, pastry counter and drink
  interactions remain available to every character.

## Sound and feedback

The existing Web Audio implementation now uses small synthesized cues for taps,
pickups, travel, success, sleep, switches and bells. Music uses a three-voice
ambient chord that changes gently by location. No audio files or dependencies
were added.

Location changes display a short icon-and-title curtain. Actions use a sparkle
burst and optional short vibration on coarse-pointer devices. Small-screen mood
controls remain available instead of being hidden.

## Save migration

The save format is version 7. Version 6 character records are preserved as-is,
while the new television, music-box, mailbox and café-bell fields receive safe
defaults. Version 5 and earlier saves still migrate through the PLAY.2 migration
path, retaining Khadija, room layout, lighting and player settings.

## Performance

- Character upgrades use primitive meshes and transform-only expressions.
- No physics, post-processing, textures, audio downloads or new dependencies.
- Only characters in the active location receive full animation updates.
- Low-detail mode continues to disable decorative scene meshes.
- Movement continues to reuse scratch vectors in the render loop.
