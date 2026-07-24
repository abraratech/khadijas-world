# FOUNDATION.1 — Interactive Dollhouse Benchmark

## Goal

Prove that Khadija's World can deliver its core dollhouse interaction model on the project's minimum supported laptop before committing to production art.

## Included in R1

- Babylon.js 9 + TypeScript + Vite foundation
- WebGL-first rendering path
- Orthographic dollhouse camera
- One combined living-room/kitchen benchmark
- Low and balanced graphics presets
- Three placeholder characters
- Three draggable props
- One animated cupboard door
- One interactive lamp
- Local room-state persistence

## Explicitly excluded

- Final character models
- Skeletal animation
- Dress-up system
- Food recipes
- Full inventory
- Mobile release certification
- Outdoor neighbourhood
- WebGPU dependency
- Multiplayer, accounts or monetization

## Performance budget

| Area | R1 budget |
|---|---:|
| Active room | 1 |
| Characters | 3 |
| Interactive movable props | 3 initially; 25–40 before approval |
| Dynamic shadow-casting lights | 0 on low preset |
| Internal resolution | Approximately 720p on low preset |
| Minimum target | Stable 30 FPS |
| Save method | LocalStorage |

## Approval tests

- [ ] Runs on the designated Intel 4th-gen / 8 GB laptop
- [ ] Maintains 30 FPS for five minutes
- [ ] Dragging remains responsive
- [ ] No browser tab crash or GPU reset
- [ ] Refresh restores prop positions
- [ ] Refresh restores cupboard and lamp state
- [ ] Room loads in an acceptable time on local and hosted builds
- [ ] Visual direction remains attractive without post-processing

## Next release after approval

**CHARACTERS.1 R1** will replace one placeholder with the first optimized Khadija `.glb`, including an idle animation, facial expression controls, clothing attachment points and an object-holding socket.
