import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  color: text("color").notNull().default("#5865F2"),
  thumbnailUrl: text("thumbnail_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const factions = pgTable("factions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const handlers = pgTable("handlers", {
  id: serial("id").primaryKey(),
  factionId: integer("faction_id")
    .notNull()
    .references(() => factions.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("Handler"),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const editors = pgTable("editors", {
  discordId: text("discord_id").primaryKey(),
  label: text("label").notNull().default(""),
  addedBy: text("added_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

// The LFM Structure section: independent documents (e.g. "Team Structure",
// "Authority & Sign-Off Levels"), each an ordered list of roles. Each role
// holds its own body text (markdown, may include "- " bullet lines) instead
// of a nested list like factions/handlers, since the source content is prose
// and bullet points rather than another level of records.
export const structureDocs = pgTable("structure_docs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  discordMessageIds: text("discord_message_ids").notNull().default("[]"),
});

export const structureRoles = pgTable("structure_roles", {
  id: serial("id").primaryKey(),
  docId: integer("doc_id")
    .notNull()
    .references(() => structureDocs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#5865F2"),
  thumbnailUrl: text("thumbnail_url"),
  body: text("body").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const structureDocsRelations = relations(structureDocs, ({ many }) => ({
  roles: many(structureRoles),
}));

export const structureRolesRelations = relations(structureRoles, ({ one }) => ({
  doc: one(structureDocs, {
    fields: [structureRoles.docId],
    references: [structureDocs.id],
  }),
}));

export type StructureDoc = typeof structureDocs.$inferSelect;
export type StructureRole = typeof structureRoles.$inferSelect;

export const categoriesRelations = relations(categories, ({ many }) => ({
  factions: many(factions),
}));

export const factionsRelations = relations(factions, ({ one, many }) => ({
  category: one(categories, {
    fields: [factions.categoryId],
    references: [categories.id],
  }),
  handlers: many(handlers),
}));

export const handlersRelations = relations(handlers, ({ one }) => ({
  faction: one(factions, {
    fields: [handlers.factionId],
    references: [factions.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type Faction = typeof factions.$inferSelect;
export type Handler = typeof handlers.$inferSelect;
export type Editor = typeof editors.$inferSelect;
