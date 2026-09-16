import {
  buildEmbeds,
  chunk,
  DESCRIPTION_LIMIT,
  EMBEDS_PER_MESSAGE,
  type CategoryLike,
  type DiscordEmbed,
  type EmbedSettings,
} from "./embed";

const JSON_HEADERS = { "Content-Type": "application/json" };

export function webhookConfigured(): boolean {
  return Boolean(process.env.DISCORD_WEBHOOK_URL);
}

function webhookBase(): string {
  const raw = process.env.DISCORD_WEBHOOK_URL;
  if (!raw) throw new Error("DISCORD_WEBHOOK_URL is not set.");
  const u = new URL(raw);
  return `${u.origin}${u.pathname}`;
}

function validate(tree: CategoryLike[], embeds: DiscordEmbed[]) {
  embeds.forEach((e, i) => {
    const length = e.description?.length ?? 0;
    if (length > DESCRIPTION_LIMIT) {
      throw new Error(
        `Category "${tree[i].name}" is ${length} characters long. Discord allows ${DESCRIPTION_LIMIT}. Split it into two categories.`,
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

/**
 * Posts every category as an embed. Reuses message ids from a previous post so
 * the channel keeps one (or a few) messages that update in place.
 */
export async function postTreeToDiscord(
  tree: CategoryLike[],
  settings: EmbedSettings,
  previousIds: string[],
): Promise<PostResult> {
  const base = webhookBase();
  const embeds = buildEmbeds(tree, settings);
  validate(tree, embeds);

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
