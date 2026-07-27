# QA.1 Browser Acceptance

QA.1 adds Chromium-based production-build acceptance tests with Playwright.

## Commands

```powershell
npm run qa:install
npm run check:qa
npm run qa:browser
npm run qa:verified
```

`qa:install` downloads the pinned Chromium build once. `qa:browser` builds the
production bundle, launches `vite preview` on `127.0.0.1:4173`, and runs the
browser suite. Failure artifacts are written to `test-results`; the HTML report
is written only in CI.

## Covered flows

- Fresh-world creation and Continue enablement
- Onboarding dismissal persistence
- Production startup and browser error capture
- Location travel, accessible announcement, save, and reload restoration
- Title, Help, Settings, and Pause focus behavior
- NPC chat, typed replies, and focus restoration
- Portrait and short-landscape containment
- Display recovery

The `?qa=1` query enables a minimal conversation-opening bridge. The bridge is
not present during normal play and cannot modify save data directly.
