import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, editors, factions, handlers, settings, structureDocs, structureRoles } from "@/db/schema";

export async function getTree() {
  return getDb().query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.id)],
    with: {
      factions: {
        orderBy: [asc(factions.sortOrder), asc(factions.id)],
        with: {
          handlers: { orderBy: [asc(handlers.sortOrder), asc(handlers.id)] },
        },
      },
    },
  });
}

export type Tree = Awaited<ReturnType<typeof getTree>>;
export type TreeCategory = Tree[number];
export type TreeFaction = TreeCategory["factions"][number];
export type TreeHandler = TreeFaction["handlers"][number];

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await getDb().select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getEditors() {
  return getDb().select().from(editors).orderBy(asc(editors.createdAt));
}

export async function getStructureDocs() {
  return getDb().query.structureDocs.findMany({
    orderBy: [asc(structureDocs.sortOrder), asc(structureDocs.id)],
    with: {
      roles: { orderBy: [asc(structureRoles.sortOrder), asc(structureRoles.id)] },
    },
  });
}

export type StructureTree = Awaited<ReturnType<typeof getStructureDocs>>;
export type StructureTreeDoc = StructureTree[number];
export type StructureTreeRole = StructureTreeDoc["roles"][number];
