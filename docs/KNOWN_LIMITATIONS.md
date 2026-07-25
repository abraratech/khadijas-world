# Known Limitations

- Physical validation on the designated older laptop is still required; no
  stable-30-FPS claim is made for hardware that was unavailable to this pass.
- Chrome, Edge, Firefox, and a representative touch device require final
  hands-on release approval. Automated validation used the Codex in-app
  Chromium browser.
- The web manifest supplies install identity, but Release 1 does not register a
  service worker. Offline use works from a local/WAMP host after files are
  available; first navigation still requires the host. Updates use a normal hard
  refresh, avoiding stale application caches.
- The parent arithmetic gate reduces accidental access but is not a security or
  identity system.
- The 3D canvas does not provide a complete text alternative for every visual
  object and the game has no narration.
- Portrait phone layouts are supported for controls but landscape provides the
  intended play area.
- Contributor and support-contact details remain clearly marked placeholders.
- The main runtime bundle is large because the six-location Babylon.js scene is
  shipped as one chunk; safe location-level lazy loading is deferred.
