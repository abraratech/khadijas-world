# Manual Regression Checklist

Record browser, viewport, graphics preset, save origin, and console-error count.

## ARCHITECTURE.1 scene reinitialization

- [ ] Start a new world, return to title, and start again without duplicate
  meshes, characters, listeners, timers, or music
- [ ] Continue an existing schema 12 world and confirm positions, rooms,
  outfits, expressions, held items, seats, storage, and NPC state
- [ ] Switch through all six locations repeatedly by tray and doors
- [ ] Refresh in each location and confirm the same state is restored
- [ ] Export a save, start a new world, import it, and verify restoration
- [ ] Compare normal play with `?debug=1`; diagnostics remain opt-in
- [ ] Check the console during transitions, title return, import, refresh, and
  graphics changes

## Startup and saves

- [ ] Fresh world starts with safe defaults
- [ ] Existing schema 10 save migrates without progress loss
- [ ] Malformed primary restores the valid backup
- [ ] Both-invalid flow keeps unreadable data and offers a fresh world
- [ ] Low, Medium, and High settings restore after refresh
- [ ] Repeated saves do not duplicate held or stored items

## Characters and NPCs

- [ ] Confirm Khadija is the only player-selector option
- [ ] Walk Khadija by floor click and keyboard; drag all three family characters
- [ ] Confirm sister and brother remain companions and never become the player
- [ ] Hand items between Khadija and each companion and restore after refresh
- [ ] Change Khadija's outfit and expression; verify fallback where required
- [ ] Sit, sleep, stand, and use a shared activity
- [ ] Verify companion idle behavior and bounded little walks
- [ ] Visit all seven NPCs; test gift, work pose, chat, memory, and friendship

## ART.1A production character

- [ ] Run `npm run validate:assets`
- [ ] Adaptive/High loads the textured Meshy Khadija with no duplicate visual
- [ ] Walking clip loops during movement and stops when movement ends
- [ ] Low quality stays procedural and does not request the production GLB
- [ ] Teal/yellow outfit, unsupported expression, sitting, sleeping, and item-use
  actions switch safely to the procedural visual
- [ ] Returning to pink + neutral/happy + standing restores production visual
- [ ] Temporarily rename the GLB and verify a non-fatal procedural fallback
- [ ] Existing sibling-selected save opens in the same location as Khadija
- [ ] Sister/brother position, held item, outfit, and room state remain intact
- [ ] Test Vite and hard-refresh WAMP asset paths
- [ ] Record first load, GLB parse time, FPS, and memory on target hardware

## Everyday play

- [ ] Pick up, drag, drop, snap, store, and remove objects
- [ ] Test backpack, basket, tray, shopping basket, shopping bag, and picnic basket
- [ ] Prepare fruit bowl, sandwich, toast, juice, cupcake, and tea
- [ ] Test appliances, cleaning, hygiene, shopping checkout, picnic, and playground

## Locations

- [ ] Enter and exit home, bedroom, street, café, park, and grocery
- [ ] Switch repeatedly and verify camera, lighting, audio, held item, and character
- [ ] Confirm inactive characters and NPCs do not advance full updates
- [ ] Toggle every home and bedroom light after repeated transitions
- [ ] Confirm each location has exactly one geometry root and no duplicate
  interaction response

## UI and input

- [ ] Mouse short click, item drag, and character drag are distinct
- [ ] Touch emulation does not double-activate or scroll the page
- [ ] Keyboard movement stops while chat input is focused
- [ ] Chat closes on location and character change
- [ ] Suggested topics work with typed chat disabled
- [ ] Settings and modals fit 1280×720, 1024×768, 1366×768, 800×1280, 1280×800
- [ ] Gentle motion, larger words, stronger colors, and instant replies visibly work
- [ ] All controls show keyboard focus and fullscreen failure is friendly

## Production

- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run deploy:wamp`
- [ ] Hard refresh `http://localhost/khadijas-world/`
- [ ] No missing assets, console errors, source maps, secrets, or normal-mode diagnostics
- [ ] `?debug=1` diagnostics remain opt-in

## ART.1B family-home and item checks

- [ ] Rounded home furniture loads without black/inverted faces
- [ ] Floor clicks still work around rug, sofa, table, fridge, island, and counter
- [ ] Both sofa seat slots remain aligned
- [ ] TV and cupboard interactions remain functional
- [ ] Teddy, book, apple, and cup drag, snap, hold, use, drop, and reload correctly
- [ ] Serving tray remains usable in Sunny Café
- [ ] Recipes still recognize preparation plate and mixing bowl targets
- [ ] Pink, teal, and yellow keep the Meshy Khadija visual
- [ ] Low quality hides optional trim/shadows but preserves gameplay
- [ ] Existing schema-12 save loads without item ownership duplication
