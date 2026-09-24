import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { count } from "drizzle-orm";
import { getDb } from "./index";
import { categories, factions, handlers, settings, structureDocs, structureRoles } from "./schema";

type SeedCategory = {
  name: string;
  color: string;
  description: string;
  factions: { name: string; handlers: [string, string][] }[];
};

const SEED_CATEGORIES: SeedCategory[] = [
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

type SeedRole = { name: string; color: string; body: string };
type SeedDoc = { title: string; roles: SeedRole[] };

// Colors shared by the same role across both documents.
const HEAD_COLOR = "#FEE75C"; // gold
const SENIOR_COLOR = "#57F287"; // green
const HANDLER_COLOR = "#5865F2"; // blurple
const SUPPORT_COLOR = "#EB459E"; // fuchsia

const SEED_STRUCTURE_DOCS: SeedDoc[] = [
  {
    title: "Legal Faction Management Team Structure",
    roles: [
      {
        name: "Asst/Head of LFM",
        color: HEAD_COLOR,
        body: [
          "The Head/Assistant head of LFM leads the team and is ultimately accountable for how it performs.",
          "",
          "- Oversees all areas of the team, including its handlers, support staff, and day-to-day operations.",
          "- Sets the team's direction, standards, and long-term goals.",
          "- Reviews and approves changes to faction policy, structure, and guidelines.",
          "- Recruits, promotes, and, where necessary, removes team members.",
          "- Deals with escalated cases and difficult decisions that senior members cannot resolve.",
          "- Acts as the main link between LFM and other departments heads, such as, illegal faction management, Property Management and Development",
          "- Sets up LFM meetings and reviews performance to keep standards consistent.",
          "- Ensures the team is trained, supported, and working well together",
          "- Handle Medical licenses",
          "- Oversee the implementation of Legal Faction directives",
          "- Approves development requests that impact other factions on the server.",
          "- Signs off fully on the mutual aid agreements",
        ].join("\n"),
      },
      {
        name: "Senior LFM Member",
        color: SENIOR_COLOR,
        body: [
          "Senior members are experienced staff who guide handlers and keep the middle layer of the team running smoothly.",
          "",
          "- First point of contact for LFM Handlers when they need input, guidance, or a second opinion.",
          "- Responsible for a group of factions and the handlers assigned to them.",
          "- Reviews handler decisions on complex or sensitive cases, and steps in when a case needs a more experienced view.",
          "- Mentors and trains new handlers, giving feedback on their work.",
          "- Monitors the workload across their handlers and redistributes cases where needed.",
          "- Ensures handlers follow policy and treat factions consistently.",
          "- Escalates serious issues, such as leadership disputes or repeated rule violations, to the Head of LFM.",
          "- Reports regularly to the Head of LFM on the state of their factions.",
          "- Assists with faction reports when the faction report is extremely complex",
          "- Handle no mic requests",
          "- Handles tickets that require a senior admin",
          "- Partial sign off on the mutual aid agreements",
        ].join("\n"),
      },
      {
        name: "LFM Handler",
        color: HANDLER_COLOR,
        body: [
          "Handlers are the direct link between the team and the factions they look after.",
          "",
          "- Direct point of contact for their assigned factions.",
          "- Responsible for maintaining the quality of those factions, including roleplay standards, structure, and leadership.",
          "- Handles requests from factions, such as changes to structure, ranks, equipment, or operations & vehicles and handles them on the spot.",
          "- Handles complaints and reports about the factions and their members, investigating fairly and impartially.",
          "- Communicates decisions clearly to faction leadership and follows up on outcomes.",
          "- Monitors faction activity and holds regular check-ins with leadership.",
          "- Ensures factions follow server rules and faction guidelines, and issues warnings or recommends sanctions when they don't.",
          "- Keeps accurate records of cases, decisions, and communications.",
          "- Raises unresolved or serious matters with their Senior LFM Member.",
          "- Supports faction leaders in developing their factions, and helps struggling factions improve.",
          "- Handles relevant faction reports on assigned factions.",
          "- Approves development requests when the request does not impact anything other than the faction.",
          "- Ability to handle property requests for their faction with advice from senior if needed.",
          "- Ability to handle faction budgets with advice from senior if needed.",
          "- Ability to consult seniors should they require advice",
          "- Handles tickets",
        ].join("\n"),
      },
      {
        name: "LFM Support",
        color: SUPPORT_COLOR,
        body: [
          "Support staff keep the team's infrastructure and administration in order and reduce the load on handlers.",
          "",
          "- Moderates faction Discords and their forum boards, and notifies the relevant handler of concerns they may have missed.",
          "- Tags a log with handlers and helps them through the process to share the workload.",
          "- Manages the LFM Discord, including issuing roles and groups, and notifies the Head of LFM if anything is missing or misconfigured.",
          "- Carries out general quality assurance on all written documents, checking for accuracy, clarity, and consistency.",
          "- Assists with administrative tasks such as tracking cases, organising records, and preparing reports.",
          "- Assists handlers with their daily duties.",
          "- Flags trends, such as recurring complaints or inactive factions, to handlers and seniors.",
          "- Give input on private LFM discussions.",
          "- Handles tickets",
        ].join("\n"),
      },
    ],
  },
  {
    title: "LFM Authority and Sign-Off Levels",
    roles: [
      {
        name: "Head of LFM",
        color: HEAD_COLOR,
        body: [
          "**Can approve or sign off on:**",
          "- New legal factions, or the closure or merger of existing ones",
          "- Changes to structure, or LFM policy",
          "- Appointment, promotion, demotion, and removal of LFM members",
          "- Appointment or removal of faction leaders, where a Senior has escalated it or a dispute exists",
          "- Major sanctions against a faction, such as restructuring, or disbandment",
          "- Appeals against Senior LFM decisions",
          "- Cross-department agreements with other teams, such as illegal faction management or Property Management",
          "- Large Development requests that affect other factions",
        ].join("\n"),
      },
      {
        name: "Senior LFM Member",
        color: SENIOR_COLOR,
        body: [
          "**Can approve or sign off on:**",
          "- Faction structure changes (ranks, divisions, sub-departments) within existing policy",
          "- Requests that go above a handlers limit",
          "- Formal warnings and moderate sanctions against factions or leaders",
          "- Handler decisions that need a second opinion, whether upholding or overturning them",
          "- Reassigning factions between the handlers underneath themselves",
          "- Case closures on complex or sensitive matters involving their factions",
          "- Small development requests that affect their own faction",
          "",
          "**Must escalate to Head of LFM:**",
          "- Suspension or disbandment of a faction",
          "- Changes that set new precedent or conflict with existing policy",
          "- Disputes involving other staff or other departments",
          "- Appeals against their own decisions or handlers decisions",
          "- Faction leader changes within their assigned factions, once the handler has investigated",
        ].join("\n"),
      },
      {
        name: "LFM Handler",
        color: HANDLER_COLOR,
        body: [
          "**Can approve or sign off on:**",
          "- Routine faction requests within existing guidelines, day to day requests",
          "- Faction member transfers or roster updates",
          "- General Reports on Factions & Members",
          "- Closure of low-severity complaints and reports after investigation",
          "- Acknowledgement and logging of all requests and complaints",
          "- Recommendations to their Senior",
          "",
          "**Must escalate to Senior LFM Member:**",
          "- Any request outside existing guidelines",
          "- Leadership disputes or requests to remove a leader",
          "- Serious or repeated rule breaches",
          "- Complaints involving staff, leaders, or high-profile members",
          "- Anything they are unsure about",
          "- If you wish to issue an LFM ban",
        ].join("\n"),
      },
      {
        name: "LFM Support",
        color: SUPPORT_COLOR,
        body: [
          "**Can approve or sign off on:**",
          "- Discord role and group issuance in line with the roster",
          "- Quality-assurance edits to documents (spelling, clarity, formatting), without changing meaning or policy",
          "- Routine moderation actions on faction Discords and boards",
          "",
          "**Cannot:**",
          "- Approve faction requests, sanctions, or structural changes",
          "- Make or overturn handler decisions",
          "- Change policy or the meaning of any document",
          "",
          "**Must notify:** The relevant handler of concerns spotted on faction Discords or boards, and the Head of LFM of missing or broken Discord setup.",
        ].join("\n"),
      },
    ],
  },
];

async function seedHandlers(db: ReturnType<typeof getDb>, force: boolean) {
  const [{ value: existing }] = await db.select({ value: count() }).from(categories);
  if (existing > 0 && !force) {
    console.log(`Handlers: already has ${existing} categories, skipping (use --force to wipe and reseed).`);
    return;
  }
  if (force) {
    await db.delete(categories);
    console.log("Handlers: cleared existing categories, factions and handlers.");
  }

  for (const [ci, cat] of SEED_CATEGORIES.entries()) {
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
  console.log(`Handlers: seeded ${SEED_CATEGORIES.length} categories.`);
}

async function seedStructure(db: ReturnType<typeof getDb>, force: boolean) {
  const [{ value: existing }] = await db.select({ value: count() }).from(structureDocs);
  if (existing > 0 && !force) {
    console.log(`Structure: already has ${existing} documents, skipping (use --force to wipe and reseed).`);
    return;
  }
  if (force) {
    await db.delete(structureDocs);
    console.log("Structure: cleared existing documents and roles.");
  }

  for (const [di, doc] of SEED_STRUCTURE_DOCS.entries()) {
    const [d] = await db.insert(structureDocs).values({ title: doc.title, sortOrder: di }).returning();
    await db.insert(structureRoles).values(
      doc.roles.map((role, ri) => ({
        docId: d.id,
        name: role.name,
        color: role.color,
        body: role.body,
        sortOrder: ri,
      })),
    );
  }
  console.log(`Structure: seeded ${SEED_STRUCTURE_DOCS.length} documents.`);
}

async function main() {
  const db = getDb();
  const force = process.argv.includes("--force");

  await seedHandlers(db, force);
  await seedStructure(db, force);

  await db
    .insert(settings)
    .values([
      { key: "author_name", value: "Legal Faction Management" },
      { key: "author_icon_url", value: "" },
      { key: "footer_text", value: "" },
      { key: "site_url", value: "" },
    ])
    .onConflictDoNothing();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
