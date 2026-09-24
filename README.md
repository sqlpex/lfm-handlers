# LFM Faction Handlers

A small web app for the Legal Faction Management team. It replaces the hand-maintained Discord embeds with:

- a public **Handlers** page listing every category, faction and handler, rendered to look like the Discord embeds;
- a public **Structure** page listing the LFM role hierarchy (Team Structure, Authority & Sign-Off Levels), same embed look;
- an admin section, split into a Handlers tab and a Structure tab, where allowlisted Discord users edit everything inline with drag-and-drop ordering;
- a **Post to Discord** button on each section that sends its data to a channel webhook as embeds, and edits the existing message on later posts.

Stack: Next.js 16 (App Router), Neon Postgres via Drizzle, Auth.js with the Discord provider, Tailwind. Deploys to Vercel.

## 1. Discord setup

**OAuth application** (for editor sign-in)

1. Go to <https://discord.com/developers/applications> and create an application.
2. Under **OAuth2**, copy the Client ID and generate a Client Secret.
3. Add these redirect URLs:
   - `https://<your-vercel-domain>/api/auth/callback/discord`
   - `http://localhost:3000/api/auth/callback/discord` (for local dev)

**Channel webhooks** (for posting)

1. In Discord, open the target channel's settings, then **Integrations**, then **Webhooks**, then **New Webhook**.
2. Copy the webhook URL. The name and avatar you set here are overridden by the app's embed settings, so leave them default.
3. Handlers has one fixed channel, set as an environment variable (below). Each LFM Structure document has its own channel instead: create one webhook per document and paste each URL into that document's panel on `/admin/structure`, no redeploy needed.

**Editor IDs**

Enable Developer Mode in Discord (User Settings, Advanced), right-click a user, and choose **Copy User ID**. Put the initial admins in `ADMIN_DISCORD_IDS`; further editors can be added from the admin page.

## 2. Vercel and database

1. Push this repo to GitHub and import it in Vercel.
2. In the Vercel project, open **Storage**, choose **Neon** from the marketplace, and create a free database. Vercel will add `DATABASE_URL` to the project's environment variables.
3. Add the remaining environment variables from `.env.example`:

| Variable | Value |
| --- | --- |
| `AUTH_SECRET` | output of `npx auth secret` (any long random string) |
| `AUTH_DISCORD_ID` | Discord application client ID |
| `AUTH_DISCORD_SECRET` | Discord application client secret |
| `ADMIN_DISCORD_IDS` | comma-separated Discord user IDs of the bootstrap admins |
| `DISCORD_WEBHOOK_URL` | Handlers channel webhook URL |

4. Deploy. Then set each LFM Structure document's webhook from its own panel on `/admin/structure` (see above) — there's no environment variable for it.

## 3. Create the tables and seed

Run these once from your machine, with the same `DATABASE_URL` in a local `.env.local`:

```bash
npm install
npm run db:push     # creates the tables
npm run db:seed     # inserts the current Handlers data and the LFM Structure documents
```

`db:seed` seeds Handlers and Structure independently, and skips whichever one already has rows, so it's safe to rerun after adding one but not the other. Use `npm run db:seed -- --force` to wipe and reseed both.

## Local development

```bash
cp .env.example .env.local   # fill in the values
npm run dev
```

Open <http://localhost:3000>. Handlers admin is at `/admin`, Structure admin at `/admin/structure`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | local dev server |
| `npm run build` | production build |
| `npm run db:push` | sync the schema in `src/db/schema.ts` to the database |
| `npm run db:seed` | seed initial data |
| `npm run db:studio` | browse the database in Drizzle Studio |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## How it fits together

| Path | What it does |
| --- | --- |
| `src/db/schema.ts` | tables: `categories`, `factions`, `handlers` (Handlers) and `structureDocs`, `structureRoles` (Structure), plus `editors`, `settings`. Each `structureDocs` row carries its own `webhookUrl` |
| `src/lib/embed.ts` | turns either a category tree or a structure document's roles into Discord embed objects; used by both the preview and the webhook |
| `src/lib/discord.ts` | webhook client, given whichever URL applies (env var for Handlers, `doc.webhookUrl` for Structure); edits previous messages in place, creates new ones when needed |
| `src/lib/actions.ts` | server actions behind every edit; each one checks the editor allowlist |
| `src/lib/access.ts` | who counts as an editor (env admins plus the `editors` table) |
| `src/components/EmbedCard.tsx` | Discord-look rendering of a built embed, including real bullet lists, used everywhere an embed is previewed |
| `src/components/admin/` | admin UI: sortable lists, inline editing, settings, editors, post buttons for both sections |

Each structure role stores one `body` field of markdown-ish text (an intro paragraph, then `- ` bullet lines, and `**bold**` sub-headings where needed) rather than a nested list like Handlers has, since the source content is prose and bullet points, not another level of records.

## Notes and limits

- A Discord embed description is capped at 4096 characters. The post action refuses and names the category or role that's over the limit. Split long ones into two.
- Discord allows 10 embeds per message. With more than 10 categories, or more than 10 roles in one structure document, the app sends several messages and tracks all of them.
- Buttons under the message need a bot, not a webhook, so the website link is placed inside the last embed instead.
