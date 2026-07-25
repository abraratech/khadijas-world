# Browser Support

## Tested in this development pass

- Codex in-app Chromium browser: startup, six locations, NPC chat, settings,
  responsive layout, save migration, normal mode, and debug mode
- WAMP/Apache subpath: production deployment and asset loading

## Release validation required

- Current Google Chrome on Windows
- Current Microsoft Edge on Windows
- Current Firefox on Windows
- Representative touch tablet or convertible device
- Safari, if the eventual public release targets Apple devices

The game requires a modern browser with hardware-accelerated 3D canvas support,
ES2020 JavaScript, local browser storage for persistence, and Web Audio for sound.
If audio cannot start automatically, it begins after the first player interaction.
If local storage is unavailable, temporary play remains possible but progress may
not persist.

No compatibility is claimed for a browser that was not actually tested.
