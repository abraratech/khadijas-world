# PERF.2 Runtime and Memory Stability

PERF.2 strengthens long-session runtime stability without changing gameplay,
save schemas, production assets, or location behavior.

## Adaptive resolution

Adaptive graphics now use a dedicated, unit-tested controller.

Behavior:

- FPS is evaluated in four-second sampling windows.
- Sustained FPS below 28 increases Babylon's hardware scaling level.
- Sustained FPS above 50 must pass two recovery windows before resolution rises.
- Scaling remains bounded between 1.15 and 2.00.
- An eight-second cooldown prevents rapid resolution oscillation.
- Sampling state is reset after quality changes, page visibility changes,
  WebGL recovery, and manual display recovery.
- Debug diagnostics expose the active internal scaling level.

A larger Babylon hardware scaling level represents a lower internal rendering
resolution.

## Runtime teardown

Page teardown now:

- stops the Babylon render loop
- resets adaptive-resolution state
- clears active interface and transition timers
- removes viewport listeners
- disposes the room runtime
- disposes game audio
- disposes the Babylon engine

Existing scene, character, furniture, material, texture, animation, and
location disposal remains unchanged.

## Automated coverage

`src/game/performance/adaptiveResolution.test.ts` verifies:

- low-FPS degradation
- sustained high-FPS recovery
- neutral-window recovery reset
- adjustment cooldown
- safe scaling limits
- invalid-sample rejection
- stale-state reset

`tests/browser/performance.spec.ts`:

1. opens a completed production world
2. warms all six locations and their lazy imports
3. waits for Babylon resource counts to stabilize
4. performs five complete six-location travel cycles
5. returns home
6. verifies that mesh, material, texture, transform-node, and animation-group
   counts match the stabilized baseline
7. checks for browser errors, page errors, and unhandled promise rejections

The test observes Babylon-managed resource counts. It is not a direct
JavaScript heap-size benchmark.

## Commands

- `npm run qa:perf`
- `npm run qa:browser`
- `npm run qa:verified`
- `npm run deploy:wamp`

## PERF.2 validation result

- Adaptive-resolution tests: 6 passed
- Complete unit suite: 86 passed
- Browser endurance test: passed
- Complete browser suite: 8 passed
- Production build: passed
- Bundle budget: 131 JavaScript chunks, all at or below 500 KiB
- Repeated-location resource growth: none observed after stabilization
