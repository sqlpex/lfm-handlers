import { EmbedCard } from "@/components/EmbedCard";
import { SiteHeader } from "@/components/SiteHeader";
import { currentUser, isEditor } from "@/lib/access";
import { buildRoleEmbeds } from "@/lib/embed";
import { getSettings, getStructureDocs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function StructurePage() {
  const user = await currentUser();

  let docs: Awaited<ReturnType<typeof getStructureDocs>> = [];
  let settings: Record<string, string> = {};
  let canEdit = false;
  let dbError: string | null = null;
  try {
    [docs, settings, canEdit] = await Promise.all([
      getStructureDocs(),
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
        ) : docs.length === 0 ? (
          <p className="text-[#949ba4]">No structure documents yet. Sign in as an editor to add some.</p>
        ) : (
          <div className="space-y-10">
            {docs.map((doc) => (
              <section key={doc.id}>
                <h2 className="mb-3 text-lg font-semibold text-white">{doc.title}</h2>
                {doc.roles.length === 0 ? (
                  <p className="text-sm text-[#6d6f78]">No roles yet.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {buildRoleEmbeds(doc.roles, settings).map((embed, i) => (
                      <EmbedCard key={doc.roles[i].id} embed={embed} color={doc.roles[i].color} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
