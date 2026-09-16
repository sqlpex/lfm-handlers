import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { editors } from "@/db/schema";

export function envAdminIds(): string[] {
  return (process.env.ADMIN_DISCORD_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function isEditor(discordId: string): Promise<boolean> {
  if (envAdminIds().includes(discordId)) return true;
  const row = await getDb().query.editors.findFirst({
    where: eq(editors.discordId, discordId),
  });
  return Boolean(row);
}

export type CurrentUser = { id: string; name: string; image: string | null };

export async function currentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  return {
    id: user.id,
    name: user.name ?? "Unknown",
    image: user.image ?? null,
  };
}

export async function requireEditor(): Promise<CurrentUser> {
  const user = await currentUser();
  if (!user) throw new Error("You need to sign in first.");
  if (!(await isEditor(user.id))) {
    throw new Error("Your Discord account is not on the editor list.");
  }
  return user;
}
