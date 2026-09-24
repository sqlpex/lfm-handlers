import {
  buildEmbeds,
  buildRoleEmbeds,
  chunk,
  DESCRIPTION_LIMIT,
  EMBEDS_PER_MESSAGE,
  type CategoryLike,
  type DiscordEmbed,
  type EmbedSettings,
  type RoleLike,
} from "./embed";

const JSON_HEADERS = { "Content-Type": "application/json" };

export function handlersWebhookConfigured(): boolean {
  return Boolean(process.env.DISCORD_WEBHOOK_URL);
}

function toBase(raw: string): string {
  const u = new URL(raw);
  return `${u.origin}${u.pathname}`;
}

function validate(labels: string[], embeds: DiscordEmbed[]) {
  embeds.forEach((e, i) => {
    const length = e.description?.length ?? 0;
    if (length > DESCRIPTION_LIMIT) {
      throw new Error(
        `"${labels[i]}" is ${length} characters long. Discord allows ${DESCRIPTION_LIMIT}. Split it into two.`,
      );
    }
  });
}

async function sendChunk(
  base: string,
  body: Record<string, unknown>,
  existingId: string | undefined,
): Promise<{ id: string; updated: boolean }> {
  if (existingId) {
    const res = await fetch(`${base}/messages/${existingId}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    });
    if (res.ok) return { id: existingId, updated: true };
    if (res.status !== 404) {
      throw new Error(`Discord rejected the update (${res.status}): ${await res.text()}`);
    }
  }
  const res = await fetch(`${base}?wait=true`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Discord rejected the post (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { id: string };
  return { id: data.id, updated: false };
}

export type PostResult = { messageIds: string[]; created: number; updated: number };

/** Posts a set of already-built embeds to a webhook, editing previous message ids in place. */
async function postEmbeds(
  rawWebhookUrl: string,
  embeds: DiscordEmbed[],
  labels: string[],
  settings: EmbedSettings,
  previousIds: string[],
): Promise<PostResult> {
  const base = toBase(rawWebhookUrl);
  validate(labels, embeds);

  const groups = chunk(embeds, EMBEDS_PER_MESSAGE);
  const common = {
    username: settings.author_name?.trim() || undefined,
    avatar_url: settings.author_icon_url?.trim() || undefined,
    allowed_mentions: { parse: [] as string[] },
  };

  const result: PostResult = { messageIds: [], created: 0, updated: 0 };
  for (let i = 0; i < groups.length; i++) {
    const sent = await sendChunk(base, { ...common, embeds: groups[i] }, previousIds[i]);
    result.messageIds.push(sent.id);
    if (sent.updated) result.updated++;
    else result.created++;
  }

  // Remove leftover messages when the number of chunks shrank.
  for (const stale of previousIds.slice(groups.length)) {
    await fetch(`${base}/messages/${stale}`, { method: "DELETE" }).catch(() => undefined);
  }
  return result;
}

/**
 * Posts every category as an embed to the Handlers channel. Reuses message ids
 * from a previous post so the channel keeps one (or a few) messages that update
 * in place.
 */
export async function postTreeToDiscord(
  tree: CategoryLike[],
  settings: EmbedSettings,
  previousIds: string[],
): Promise<PostResult> {
  const raw = process.env.DISCORD_WEBHOOK_URL;
  if (!raw) throw new Error("DISCORD_WEBHOOK_URL is not set.");
  const embeds = buildEmbeds(tree, settings);
  return postEmbeds(raw, embeds, tree.map((c) => c.name), settings, previousIds);
}

/**
 * Posts one structure document's roles as embeds to that document's own channel.
 * Unlike Handlers, each structure document carries its own webhook URL (set by
 * an editor on the document itself) since editors can create new documents that
 * post to different channels without a redeploy.
 */
export async function postRolesToDiscord(
  webhookUrl: string,
  roles: RoleLike[],
  settings: EmbedSettings,
  previousIds: string[],
): Promise<PostResult> {
  const embeds = buildRoleEmbeds(roles, settings);
  return postEmbeds(webhookUrl, embeds, roles.map((r) => r.name), settings, previousIds);
}
