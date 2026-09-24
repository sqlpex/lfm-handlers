// Pure helpers shared by the Discord webhook client and the on-screen preview.

export type HandlerLike = { role: string; name: string };
export type FactionLike = { name: string; handlers: HandlerLike[] };
export type CategoryLike = {
  name: string;
  description: string;
  color: string;
  thumbnailUrl: string | null;
  factions: FactionLike[];
};

/** A structure-section role: unlike a category it has no nested list, just a body of prose/bullets. */
export type RoleLike = {
  name: string;
  body: string;
  color: string;
  thumbnailUrl: string | null;
};

export type EmbedSettings = {
  author_name?: string;
  author_icon_url?: string;
  footer_text?: string;
  site_url?: string;
};

export type DiscordEmbed = {
  title: string;
  description?: string;
  color: number;
  author?: { name: string; icon_url?: string };
  thumbnail?: { url: string };
  footer?: { text: string };
  timestamp?: string;
};

export const DESCRIPTION_LIMIT = 4096;
export const EMBEDS_PER_MESSAGE = 10;
export const DEFAULT_COLOR = "#5865F2";

export function hexToInt(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  return Number.isFinite(n) ? n : parseInt(DEFAULT_COLOR.slice(1), 16);
}

type BuildOpts = { isLast: boolean; timestamp: string };

/** Shared author/thumbnail/footer/color assembly used by both categories and structure roles. */
function baseEmbed(
  title: string,
  bodyText: string,
  color: string,
  thumbnailUrl: string | null,
  settings: EmbedSettings,
  opts: BuildOpts,
): DiscordEmbed {
  const parts = [bodyText.trim()].filter(Boolean);
  const site = settings.site_url?.trim();
  if (opts.isLast && site) {
    parts.push(`[View the full list online](${site})`);
  }
  const description = parts.join("\n\n");

  const embed: DiscordEmbed = { title, color: hexToInt(color) };
  if (description) embed.description = description;

  const authorName = settings.author_name?.trim();
  if (authorName) {
    embed.author = { name: authorName };
    const icon = settings.author_icon_url?.trim();
    if (icon) embed.author.icon_url = icon;
  }
  const thumb = thumbnailUrl?.trim();
  if (thumb) embed.thumbnail = { url: thumb };
  const footer = settings.footer_text?.trim();
  if (footer) {
    embed.footer = { text: footer };
    embed.timestamp = opts.timestamp;
  }
  return embed;
}

export function buildDescription(cat: CategoryLike): string {
  const parts: string[] = [];
  if (cat.description.trim()) parts.push(cat.description.trim());
  for (const f of cat.factions) {
    const lines = [`**${f.name}**`, ...f.handlers.map((h) => `${h.role}: ${h.name}`)];
    parts.push(lines.join("\n"));
  }
  return parts.join("\n\n");
}

export function buildEmbed(cat: CategoryLike, settings: EmbedSettings, opts: BuildOpts): DiscordEmbed {
  return baseEmbed(cat.name, buildDescription(cat), cat.color, cat.thumbnailUrl, settings, opts);
}

export function buildEmbeds(tree: CategoryLike[], settings: EmbedSettings): DiscordEmbed[] {
  const timestamp = new Date().toISOString();
  return tree.map((cat, i) =>
    buildEmbed(cat, settings, { isLast: i === tree.length - 1, timestamp }),
  );
}

export function buildRoleEmbed(role: RoleLike, settings: EmbedSettings, opts: BuildOpts): DiscordEmbed {
  return baseEmbed(role.name, role.body, role.color, role.thumbnailUrl, settings, opts);
}

export function buildRoleEmbeds(roles: RoleLike[], settings: EmbedSettings): DiscordEmbed[] {
  const timestamp = new Date().toISOString();
  return roles.map((role, i) =>
    buildRoleEmbed(role, settings, { isLast: i === roles.length - 1, timestamp }),
  );
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
