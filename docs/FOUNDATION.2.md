# FOUNDATION.2 — Accelerated Interaction and Performance Benchmark

## Goal

Combine the planned FOUNDATION.1 revisions and the first character-control prototype into one release, reducing administrative release overhead while preserving a hard performance gate.

## Included

- Improved placeholder room art and additional low-cost detail
- Adaptive graphics mode targeting responsive 30 FPS play
- Fixed older-laptop and balanced graphics modes
- Live FPS, frame-time, active-mesh and internal-resolution metrics
- Click-to-walk character navigation
- WASD and arrow-key movement
- Lightweight procedural walk animation
- Saved Khadija position
- Snap-assisted prop placement with visual markers
- Saved quality selection
- WAMP-safe relative build paths
- Automated WAMP deployment script

## Still excluded

- Final Blender-authored character models
- Skeletal animation and facial blend shapes
- Clothing and wardrobe system
- Character-object holding sockets
- Full inventory
- Recipes and food consumption
- Outdoor neighbourhood
- Accounts, cloud saving and multiplayer

## Performance budget

| Area | Accelerated budget |
|---|---:|
| Active room | 1 |
| Placeholder characters | 3 |
| Movable props | 3 benchmark props |
| Real-time shadow maps | 0 |
| Expensive post-processing | 0 |
| Adaptive scaling range | 1.15–2.0 |
| Minimum target | Responsive 30 FPS |
| Save method | LocalStorage |

## Approval tests

- [ ] Starts through `npm run dev`
- [ ] Production build completes through `npm run build`
- [ ] WAMP deployment opens at `/khadijas-world/`
- [ ] Khadija walks to clicked floor locations
- [ ] WASD and arrow controls remain responsive
- [ ] Khadija remains inside the room bounds
- [ ] Walk destination or keyboard position survives refresh
- [ ] Props display placement markers while dragging
- [ ] Props snap to nearby valid positions
- [ ] Props survive refresh in their final positions
- [ ] Cupboard and lamp states survive refresh
- [ ] Quality preset survives refresh
- [ ] Adaptive mode does not oscillate continuously
- [ ] Five-minute older-laptop test remains stable
- [ ] Browser console remains free of recurring errors

## Next combined release

**PLAY.1 Accelerated** should combine the first optimized Khadija `.glb`, idle/walk animations, one object-holding socket, a small inventory tray and the first clothing swap. That release must not begin until this benchmark passes on the designated Intel 4th-generation laptop.
