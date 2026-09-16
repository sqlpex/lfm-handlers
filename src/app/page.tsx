import { DiscordEmbed } from "@/components/DiscordEmbed";
import { SiteHeader } from "@/components/SiteHeader";
import { currentUser, isEditor } from "@/lib/access";
import { getSettings, getTree } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await currentUser();

  let tree: Awaited<ReturnType<typeof getTree>> = [];
  let settings: Record<string, string> = {};
  let canEdit = false;
  let dbError: string | null = null;
  try {
    [tree, settings, canEdit] = await Promise.all([
      getTree(),
      getSettings(),
      user ? isEditor(user.id) : Promise.resolve(false),
    ]);
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }

  return (
    <>
      <SiteHeader user={user} canEdit={canEdit} title={settings.author_name || undefined} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {dbError ? (
          <div className="rounded border border-[#f23f43]/40 bg-[#f23f43]/10 p-4 text-sm">
            <p className="font-semibold text-white">The database is not reachable.</p>
            <p className="mt-1 text-[#dbdee1]">{dbError}</p>
          </div>
        ) : tree.length === 0 ? (
          <p className="text-[#949ba4]">No categories yet. Sign in as an editor to add some.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {tree.map((category, i) => (
              <DiscordEmbed
                key={category.id}
                category={category}
                settings={settings}
                isLast={i === tree.length - 1}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
