# Cloudflare NPC chat setup

The code deploys with the existing Cloudflare Pages Git integration. The
Workers AI binding is declared in `wrangler.jsonc` as `AI`.

## Required production rate limit

Create a KV namespace in Cloudflare and bind it to the Pages project with the
variable name:

`NPC_CHAT_RATE_LIMIT`

Dashboard path:

1. Workers & Pages
2. Khadija's World Pages project
3. Settings
4. Bindings
5. Add KV namespace binding
6. Variable name: `NPC_CHAT_RATE_LIMIT`
7. Select or create a namespace such as `khadijas-world-npc-chat-rate-limit`
8. Redeploy the latest `main` deployment

The feature is off by default and can only be enabled from Grown-Up Controls.
Without the KV binding, the endpoint still works but server-side rate limiting
is skipped; bind KV before inviting real players.

## Local Functions test

Run `npm run build:cloudflare`, then use Wrangler Pages development mode with
an AI binding. Local Workers AI requests use the real Cloudflare service and
may count toward usage.
