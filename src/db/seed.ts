import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { count } from "drizzle-orm";
import { getDb } from "./index";
import { categories, factions, handlers, settings } from "./schema";

type SeedCategory = {
  name: string;
  color: string;
  description: string;
  factions: { name: string; handlers: [string, string][] }[];
};

const SEED: SeedCategory[] = [
  {
    name: "Law Enforcement",
    color: "#5865F2",
    description:
      "The following are recognized **Law Enforcement** factions by Legal Faction Management. For each of the factions there is an assigned handler and in some circumstances, there's a secondary handler.",
    factions: [
      {
        name: "Los Santos Police Department",
        handlers: [
          ["Handler", "sylo."],
          ["Senior", "humble."],
        ],
      },
      {
        name: "Los Santos Sheriff's Department",
        handlers: [
          ["Handler", "dawpi"],
          ["Senior", "SunsetGoons"],
        ],
      },
      {
        name: "State Fire Marshals",
        handlers: [
          ["Handler", "Loke"],
          ["Secondary Handler", "Dano"],
          ["Support Handler", "Chaos"],
          ["Senior", "Fanden?"],
        ],
      },
      {
        name: "San Andreas Department of Corrections and Rehabilitation",
        handlers: [
          ["Handler", "DimitriS"],
          ["Secondary Handler", "Thekillergreece"],
          ["Support Handler", "sherald"],
          ["Senior", "Fanden?"],
        ],
      },
    ],
  },
  {
    name: "Fire & Rescue",
    color: "#ED4245",
    description:
      "The following are recognized as **Fire & Rescue** factions by Legal Faction Management. For each of the factions there is an assigned handler and in some circumstances, there's a secondary handler.",
    factions: [
      {
        name: "Los Santos Fire Department",
        handlers: [
          ["Handler", "Nova"],
          ["Secondary Handler", "ThePlod"],
        ],
      },
    ],
  },
];

async function main() {
  const db = getDb();
  const force = process.argv.includes("--force");
  const [{ value: existing }] = await db.select({ value: count() }).from(categories);

  if (existing > 0 && !force) {
    console.log(
      `Database already has ${existing} categories. Run "npm run db:seed -- --force" to wipe and reseed.`,
    );
    return;
  }
  if (force) {
    await db.delete(categories);
    console.log("Cleared existing categories, factions and handlers.");
  }

  for (const [ci, cat] of SEED.entries()) {
    const [c] = await db
      .insert(categories)
      .values({ name: cat.name, color: cat.color, description: cat.description, sortOrder: ci })
      .returning();
    for (const [fi, f] of cat.factions.entries()) {
      const [row] = await db
        .insert(factions)
        .values({ categoryId: c.id, name: f.name, sortOrder: fi })
        .returning();
      await db.insert(handlers).values(
        f.handlers.map(([role, name], hi) => ({
          factionId: row.id,
          role,
          name,
          sortOrder: hi,
        })),
      );
    }
  }

  await db
    .insert(settings)
    .values([
      { key: "author_name", value: "Legal Faction Management" },
      { key: "author_icon_url", value: "" },
      { key: "footer_text", value: "" },
      { key: "site_url", value: "" },
    ])
    .onConflictDoNothing();

  console.log(`Seeded ${SEED.length} categories.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
