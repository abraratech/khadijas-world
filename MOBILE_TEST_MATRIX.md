# Mobile test matrix — RELEASE.1

## Automated layout coverage

Run `npm run release:mobile` for portrait phone, compact landscape, touch-target, policy-dialog, and keyboard-policy access checks.

## Required physical checks before announcing a public release

| Platform | View | Required checks |
|---|---|---|
| iPhone Safari | Portrait and landscape | Safe areas, title actions, install guidance, audio unlock, chat keyboard, rotate while playing |
| Android Chrome | Portrait and landscape | Install prompt, offline download, touch controls, chat keyboard, back navigation |
| Installed PWA | Portrait and landscape | Cold launch, update prompt, offline launch, return online, cloud save recovery |
| iPad/tablet | Portrait and landscape | Panel sizing, drag interactions, fullscreen, focus after hardware-keyboard input |
| Windows touch laptop | Landscape | Touch plus keyboard switching, fullscreen exit, WebGL recovery |

Record device, OS, browser version, result, and evidence in the release checklist. Automated emulation does not replace these physical checks.
