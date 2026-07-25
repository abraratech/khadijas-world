# QUALITY.1 Baseline

Recorded 24 July 2026 in the Codex in-app Chromium browser on the development
machine. These results are diagnostic snapshots, not a claim about the Intel HD
4400/4600 target laptop.

## Before QUALITY.1

- Main JavaScript: 5,086.25 kB minified / 1,146.84 kB gzip
- CSS: 21.67 kB / 5.78 kB gzip
- HTML: 55.91 kB / 8.65 kB gzip
- Production source map for the main bundle: about 19.5 MB
- Runtime console errors while opening park, grocery, and NPC chat: 0
- Existing automated tests: none

## QUALITY.1 diagnostic sample

Adaptive graphics, 1066×600 internal render size. Six debug samples were collected
per location after a short settling interval.

| Location | Average FPS | Lowest sample | Active meshes |
|---|---:|---:|---:|
| Family home | 51 | 34 | 257 |
| Bedroom | 56 | 42 | 93 |
| Street | 59 | 54 | 102 |
| Sunny Café | 60 | 58 | 115 |
| Park | 60 | 58 | 154 |
| Grocery | 59 | 54 | 153 |

The main JavaScript after reliability and accessibility work is about 5,092 kB
minified / 1,148 kB gzip. CSS is about 23.7 kB / 6.3 kB gzip. Production source
maps are now disabled, substantially reducing deployed size and avoiding source
disclosure. Exact save duration, texture memory, and draw calls are not available
from the current lightweight diagnostics and are not estimated.

## Existing architecture confirmed

- Playable and NPC animation updates are gated by active location.
- Autonomous decisions run at staggered intervals, not each frame.
- Dialogue recognition runs only on submitted messages.
- Hidden locations remain separated far outside the active camera frustum.
- Only one engine render loop is created.

## Physical validation still required

Stable 30 FPS at 1280×720 on Intel HD 4400/4600 has not been measured in this
environment. Chrome, Edge, Firefox, touch hardware, and a 20–30 minute older-laptop
soak test remain release-approval checks.
