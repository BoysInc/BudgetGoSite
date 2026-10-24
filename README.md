# BudgetGo website setup

Run `python3 dev_server.py` and open `http://127.0.0.1:4174`.

## MCP sign-in and consent

Configure the public deployment values in `src/js/mcp-config.js`:

- `supabaseUrl`: the Supabase project URL for this environment.
- `supabasePublishableKey`: its publishable or anon key. Never use a secret or
  service-role key in the website.

Deploy `/oauth/consent.html` and `/oauth/connections.html` with the rest of the
static website. These account pages are intentionally excluded from search
indexes and the public sitemap. MCP clients open consent with an
`authorization_id` issued by Supabase; the page never trusts a client ID,
user ID, or callback URL from query parameters.

Apply the MCP migration from `budgetgo-supabase`, configure `McpResource.url`
to the engine's canonical `/api/mcp/budgetgo/mcp` endpoint, enable Supabase's
OAuth server and dynamic registration, and select the
`budgetgo_mcp_access_token_hook`. Set the hosted authorization URL to
`https://YOUR-WEBSITE/oauth/consent.html`.

Use an asymmetric Supabase JWT signing key. Configure the engine's
`SUPABASE_URL`, `SUPABASE_DB_URL`, `MCP_RESOURCE_URL`, and `ENABLE_MCP=true`.
The website, engine, and database must use the same environment.

Existing accounts can sign in with their password or an email sign-in code.
For code sign-in, configure the Supabase email template to include
`{{ .Token }}`. Tab-local session storage keeps credentials out of URLs and
other tabs. Serve the pages with HTTPS and configure hosting headers to
prevent caching `/oauth/*`, set `Referrer-Policy: no-referrer`, and restrict
`connect-src` to your Supabase origin. Avoid third-party scripts on these pages.

Users can select create/edit and delete permissions independently. Read access
is required. `/oauth/connections.html` revokes the live grant before revoking
Supabase's OAuth grant. If the second request fails, access is already blocked;
use “Finish disconnecting” to retry before reconnecting from the AI client.

Connecting again after a completed disconnect shows a new consent flow.
Changing permission levels requires disconnecting and reconnecting. Signing
out of the consent page clears its session, and does not disconnect approved
AI apps.
