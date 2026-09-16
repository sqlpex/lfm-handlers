# LFM Faction Handlers

A small web app for the Legal Faction Management team. It replaces the hand-maintained Discord embeds with:

- a public page listing every category, faction and handler, rendered to look like the Discord embeds;
- an admin page where allowlisted Discord users edit categories, factions and handlers inline, with drag-and-drop ordering;
- a **Post to Discord** button that sends the same data to a channel webhook as embeds, and edits the existing message on later posts.

Stack: Next.js 16 (App Router), Neon Postgres via Drizzle, Auth.js with the Discord provider, Tailwind. Deploys to Vercel.

## 1. Discord setup

**OAuth application** (for editor sign-in)

1. Go to <https://discord.com/developers/applications> and create an application.
2. Under **OAuth2**, copy the Client ID and generate a Client Secret.
3. Add these redirect URLs:
   - `https://<your-vercel-domain>/api/auth/callback/discord`
   - `http://localhost:3000/api/auth/callback/discord` (for local dev)

**Channel webhook** (for posting)

1. In Discord, open the target channel's settings, then **Integrations**, then **Webhooks**, then **New Webhook**.
2. Copy the webhook URL. The name and avatar you set here are overridden by the app's embed settings, so leave them default.

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
| `DISCORD_WEBHOOK_URL` | channel webhook URL |

4. Deploy.

## 3. Create the tables and seed

Run these once from your machine, with the same `DATABASE_URL` in a local `.env.local`:

```bash
npm install
npm run db:push     # creates the tables
npm run db:seed     # inserts the current Law Enforcement and Fire & Rescue data
```

`db:seed` refuses to run if categories already exist. Use `npm run db:seed -- --force` to wipe and reseed.

## Local development

```bash
cp .env.example .env.local   # fill in the values
npm run dev
```

Open <http://localhost:3000>. The admin page is at `/admin`.

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
| `src/db/schema.ts` | tables: `categories`, `factions`, `handlers`, `editors`, `settings` |
| `src/lib/embed.ts` | turns the data into Discord embed objects; used by both the preview and the webhook |
| `src/lib/discord.ts` | webhook client; edits previous messages in place, creates new ones when needed |
| `src/lib/actions.ts` | server actions behind every edit; each one checks the editor allowlist |
| `src/lib/access.ts` | who counts as an editor (env admins plus the `editors` table) |
| `src/components/DiscordEmbed.tsx` | Discord-look rendering of an embed, used on the public page and admin preview |
| `src/components/admin/` | admin UI: sortable lists, inline editing, settings, editors, post button |

## Notes and limits

- A Discord embed description is capped at 4096 characters. The post action refuses and names the category if one gets that long. Split it into two categories if it happens.
- Discord allows 10 embeds per message. With more than 10 categories the app sends several messages and tracks all of them.
- Buttons under the message need a bot, not a webhook, so the website link is placed inside the last embed instead.
