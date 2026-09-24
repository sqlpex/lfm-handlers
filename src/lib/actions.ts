"use server";

import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "@/auth";
import { getDb } from "@/db";
import { categories, editors, factions, handlers, settings, structureDocs, structureRoles } from "@/db/schema";
import { requireEditor } from "./access";
import { postRolesToDiscord, postTreeToDiscord } from "./discord";
import { DEFAULT_COLOR } from "./embed";
import { getSettings, getTree } from "./queries";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/structure");
  revalidatePath("/admin/structure");
}

async function run(fn: () => Promise<string | void>): Promise<ActionResult> {
  try {
    const message = await fn();
    refresh();
    return message ? { ok: true, message } : { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

type SortableTable = typeof categories | typeof factions | typeof handlers | typeof structureDocs | typeof structureRoles;

async function nextSortOrder(table: SortableTable, where?: ReturnType<typeof eq>) {
  const db = getDb();
  const q = db.select({ max: sql<number>`coalesce(max(${table.sortOrder}), -1)` }).from(table);
  const [row] = where ? await q.where(where) : await q;
  return Number(row.max) + 1;
}

/* ---------- Categories ---------- */

export async function createCategory(): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const sortOrder = await nextSortOrder(categories);
    await getDb().insert(categories).values({
      name: "New category",
      description: "",
      color: DEFAULT_COLOR,
      sortOrder,
    });
  });
}

export async function updateCategory(
  id: number,
  data: Partial<{ name: string; description: string; color: string; thumbnailUrl: string | null }>,
): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const patch: typeof data = { ...data };
    if (patch.name !== undefined && !patch.name.trim()) patch.name = "Untitled";
    if (patch.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(patch.color)) patch.color = DEFAULT_COLOR;
    if (patch.thumbnailUrl !== undefined && !patch.thumbnailUrl?.trim()) patch.thumbnailUrl = null;
    await getDb().update(categories).set(patch).where(eq(categories.id, id));
  });
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    await getDb().delete(categories).where(eq(categories.id, id));
  });
}

export async function reorderCategories(ids: number[]): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const db = getDb();
    await Promise.all(
      ids.map((id, i) => db.update(categories).set({ sortOrder: i }).where(eq(categories.id, id))),
    );
  });
}

/* ---------- Factions ---------- */

export async function createFaction(categoryId: number): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const sortOrder = await nextSortOrder(factions, eq(factions.categoryId, categoryId));
    await getDb().insert(factions).values({ categoryId, name: "New faction", sortOrder });
  });
}

export async function updateFaction(id: number, data: { name: string }): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    await getDb()
      .update(factions)
      .set({ name: data.name.trim() || "Untitled" })
      .where(eq(factions.id, id));
  });
}

export async function deleteFaction(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    await getDb().delete(factions).where(eq(factions.id, id));
  });
}

export async function reorderFactions(ids: number[]): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const db = getDb();
    await Promise.all(
      ids.map((id, i) => db.update(factions).set({ sortOrder: i }).where(eq(factions.id, id))),
    );
  });
}

/* ---------- Handlers ---------- */

export async function createHandler(factionId: number, role = "Handler"): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const sortOrder = await nextSortOrder(handlers, eq(handlers.factionId, factionId));
    await getDb().insert(handlers).values({ factionId, role, name: "", sortOrder });
  });
}

export async function updateHandler(
  id: number,
  data: Partial<{ role: string; name: string }>,
): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const patch: typeof data = {};
    if (data.role !== undefined) patch.role = data.role.trim() || "Handler";
    if (data.name !== undefined) patch.name = data.name.trim();
    await getDb().update(handlers).set(patch).where(eq(handlers.id, id));
  });
}

export async function deleteHandler(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    await getDb().delete(handlers).where(eq(handlers.id, id));
  });
}

export async function reorderHandlers(ids: number[]): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const db = getDb();
    await Promise.all(
      ids.map((id, i) => db.update(handlers).set({ sortOrder: i }).where(eq(handlers.id, id))),
    );
  });
}

/* ---------- Structure documents ---------- */

export async function createStructureDoc(): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const sortOrder = await nextSortOrder(structureDocs);
    await getDb().insert(structureDocs).values({ title: "New document", sortOrder });
  });
}

export async function updateStructureDocTitle(id: number, title: string): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    await getDb()
      .update(structureDocs)
      .set({ title: title.trim() || "Untitled" })
      .where(eq(structureDocs.id, id));
  });
}

export async function deleteStructureDoc(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    await getDb().delete(structureDocs).where(eq(structureDocs.id, id));
  });
}

export async function reorderStructureDocs(ids: number[]): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const db = getDb();
    await Promise.all(
      ids.map((id, i) => db.update(structureDocs).set({ sortOrder: i }).where(eq(structureDocs.id, id))),
    );
  });
}

/* ---------- Structure roles ---------- */

export async function createStructureRole(docId: number): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const sortOrder = await nextSortOrder(structureRoles, eq(structureRoles.docId, docId));
    await getDb()
      .insert(structureRoles)
      .values({ docId, name: "New role", color: DEFAULT_COLOR, body: "", sortOrder });
  });
}

export async function updateStructureRole(
  id: number,
  data: Partial<{ name: string; color: string; thumbnailUrl: string | null; body: string }>,
): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const patch: typeof data = { ...data };
    if (patch.name !== undefined && !patch.name.trim()) patch.name = "Untitled";
    if (patch.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(patch.color)) patch.color = DEFAULT_COLOR;
    if (patch.thumbnailUrl !== undefined && !patch.thumbnailUrl?.trim()) patch.thumbnailUrl = null;
    await getDb().update(structureRoles).set(patch).where(eq(structureRoles.id, id));
  });
}

export async function deleteStructureRole(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    await getDb().delete(structureRoles).where(eq(structureRoles.id, id));
  });
}

export async function reorderStructureRoles(ids: number[]): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const db = getDb();
    await Promise.all(
      ids.map((id, i) => db.update(structureRoles).set({ sortOrder: i }).where(eq(structureRoles.id, id))),
    );
  });
}

/* ---------- Editors ---------- */

export async function addEditor(discordId: string, label: string): Promise<ActionResult> {
  return run(async () => {
    const me = await requireEditor();
    const id = discordId.trim();
    if (!/^\d{15,22}$/.test(id)) throw new Error("That does not look like a Discord user ID.");
    await getDb()
      .insert(editors)
      .values({ discordId: id, label: label.trim(), addedBy: me.name })
      .onConflictDoUpdate({ target: editors.discordId, set: { label: label.trim() } });
  });
}

export async function removeEditor(discordId: string): Promise<ActionResult> {
  return run(async () => {
    const me = await requireEditor();
    if (me.id === discordId) throw new Error("You cannot remove yourself.");
    await getDb().delete(editors).where(eq(editors.discordId, discordId));
  });
}

/* ---------- Settings ---------- */

const EDITABLE_SETTINGS = ["author_name", "author_icon_url", "footer_text", "site_url"] as const;

export async function updateSettings(values: Record<string, string>): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const db = getDb();
    for (const key of EDITABLE_SETTINGS) {
      if (!(key in values)) continue;
      const value = values[key].trim();
      await db
        .insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: settings.key, set: { value } });
    }
    return "Embed settings saved.";
  });
}

/* ---------- Discord ---------- */

export async function postToDiscord(): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const [tree, current] = await Promise.all([getTree(), getSettings()]);
    if (tree.length === 0) throw new Error("There are no categories to post.");

    let previous: string[] = [];
    try {
      previous = JSON.parse(current.discord_message_ids || "[]");
    } catch {
      previous = [];
    }

    const result = await postTreeToDiscord(tree, current, previous);
    const value = JSON.stringify(result.messageIds);
    await getDb()
      .insert(settings)
      .values({ key: "discord_message_ids", value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });

    if (result.created && !result.updated) return "Posted a new message to Discord.";
    if (result.updated && !result.created) return "Updated the existing Discord message.";
    return `Discord updated: ${result.updated} message(s) edited, ${result.created} new.`;
  });
}

export async function forgetDiscordMessage(): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    await getDb().delete(settings).where(eq(settings.key, "discord_message_ids"));
    return "The next post will create a fresh message.";
  });
}

export async function postStructureDocToDiscord(docId: number): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    const [doc, currentSettings] = await Promise.all([
      getDb().query.structureDocs.findFirst({
        where: eq(structureDocs.id, docId),
        with: { roles: { orderBy: [asc(structureRoles.sortOrder), asc(structureRoles.id)] } },
      }),
      getSettings(),
    ]);
    if (!doc) throw new Error("That document no longer exists.");
    if (doc.roles.length === 0) throw new Error("There are no roles to post in this document.");

    let previous: string[] = [];
    try {
      previous = JSON.parse(doc.discordMessageIds || "[]");
    } catch {
      previous = [];
    }

    const result = await postRolesToDiscord(doc.roles, currentSettings, previous);
    await getDb()
      .update(structureDocs)
      .set({ discordMessageIds: JSON.stringify(result.messageIds) })
      .where(eq(structureDocs.id, docId));

    if (result.created && !result.updated) return "Posted a new message to Discord.";
    if (result.updated && !result.created) return "Updated the existing Discord message.";
    return `Discord updated: ${result.updated} message(s) edited, ${result.created} new.`;
  });
}

export async function forgetStructureDiscordMessage(docId: number): Promise<ActionResult> {
  return run(async () => {
    await requireEditor();
    await getDb().update(structureDocs).set({ discordMessageIds: "[]" }).where(eq(structureDocs.id, docId));
    return "The next post will create a fresh message.";
  });
}

/* ---------- Auth ---------- */

export async function signInWithDiscord() {
  await signIn("discord", { redirectTo: "/admin" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
