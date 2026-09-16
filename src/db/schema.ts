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
