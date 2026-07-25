# Release 1 Checklist

Status legend: `[x]` verified in this pass, `[ ]` requires physical/manual approval.

## Repository

- [x] Public version and build identity centralized
- [x] No detected secrets, remote assets, local production paths, or temporary files
- [x] Distributed asset audit and notices completed
- [ ] Working tree clean and release commit confirmed (complete at handoff)

## Build and deployment

- [x] Automated tests pass
- [x] TypeScript and Vite production build pass
- [x] WAMP deployment passes
- [x] Production URL and no-cache refresh load without missing assets or player-visible errors

## Player and gameplay

- [x] Fresh setup, New World, Continue, title return, and pause flow browser-tested
- [x] Schema 12 default-world, import, export, backup, and migration logic covered
- [x] All six locations, three characters, seven NPCs, and representative major activities retested
- [x] Offline dialogue, audio, settings, and accessibility controls retested
- [x] Backup recovery and both-invalid-save paths covered

## Browsers and hardware

- [ ] Current Chrome on Windows
- [ ] Current Edge on Windows
- [ ] Current Firefox on Windows
- [ ] Representative touch tablet or convertible
- [ ] Designated older laptop at 1280×720 or 1366×768 for a 20-minute session

## Privacy and presentation

- [x] No account, external AI, tracking, personal-data request, or remote chat
- [x] Privacy notice, chat reminder, memory controls, credits, and notices included
- [x] Title, loading, icons, parent area, pause, save status, and friendly errors included
- [x] Normal mode verified free of development UI; `?debug=1` diagnostics verified

Release approval remains conditional on the unchecked physical cross-browser and
older-laptop items. Engineering completion should not be represented as hardware
certification.
