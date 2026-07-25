# Manual Regression Checklist

Record browser, viewport, graphics preset, save origin, and console-error count.

## Startup and saves

- [ ] Fresh world starts with safe defaults
- [ ] Existing schema 10 save migrates without progress loss
- [ ] Malformed primary restores the valid backup
- [ ] Both-invalid flow keeps unreadable data and offers a fresh world
- [ ] Low, Medium, and High settings restore after refresh
- [ ] Repeated saves do not duplicate held or stored items

## Characters and NPCs

- [ ] Select, walk, keyboard-move, and drag all three family characters
- [ ] Hand off an item and restore it after refresh
- [ ] Change outfit and expression for each character
- [ ] Sit, sleep, stand, and use a shared activity
- [ ] Verify idle behavior and bounded little walks
- [ ] Visit all seven NPCs; test gift, work pose, chat, memory, and friendship

## Everyday play

- [ ] Pick up, drag, drop, snap, store, and remove objects
- [ ] Test backpack, basket, tray, shopping basket, shopping bag, and picnic basket
- [ ] Prepare fruit bowl, sandwich, toast, juice, cupcake, and tea
- [ ] Test appliances, cleaning, hygiene, shopping checkout, picnic, and playground

## Locations

- [ ] Enter and exit home, bedroom, street, café, park, and grocery
- [ ] Switch repeatedly and verify camera, lighting, audio, held item, and character
- [ ] Confirm inactive characters and NPCs do not advance full updates

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
