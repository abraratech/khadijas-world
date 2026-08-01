# Cloudflare NPC chat setup

The code deploys through the existing Cloudflare Pages Git integration.
`wrangler.jsonc` declares the Workers AI binding as `AI` and the KV namespace
binding as `NPC_CHAT_RATE_LIMIT`.

## CHAT.2 production behavior

- Smarter replies remain off until a grown-up enables them.
- Familiar topics continue to use the offline dialogue system.
- Unknown typed messages receive an offline reply first and may then receive a
  moderated Cloudflare AI upgrade.
- Grown-ups can choose Light, Balanced, or More allowances. The server enforces
  the selected allowance up to a fixed maximum of 40 requests per day and 12
  per play session.
- The chat panel shows whether the visible reply is offline, checking, upgraded,
  cooling down, moderated, or unavailable.
- Rapid submissions are collapsed before they can create overlapping requests.
- Structured Cloudflare logs record event categories, request IDs, NPC IDs,
  locations, allowance level, timing, and counters. They do not record player
  messages, generated reply text, or local session identifiers.

## Bindings

Required `wrangler.jsonc` bindings:

- Workers AI: `AI`
- Workers KV: `NPC_CHAT_RATE_LIMIT`

The KV namespace stores short-lived counters for burst, play-session, and daily
limits. Do not remove the namespace while Smarter replies are enabled.

## Production log review

In Cloudflare, open the Pages project and use the Functions/Workers logs. Search
for JSON entries with `"service":"npc-chat"`. Useful events include:

- `reply-success`
- `rate-limited`
- `input-moderated`
- `output-moderated`
- `model-request-error`
- `rate-limit-storage-error`

## Local Functions test

Run `npm run build:cloudflare`, then start Pages development mode with the
committed Wrangler configuration. Local Workers AI requests use the real
Cloudflare service and may count toward usage.
