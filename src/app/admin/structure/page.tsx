import { AdminTabs } from "@/components/admin/AdminTabs";
import { NotOnListScreen, SignInScreen } from "@/components/admin/EditorGate";
import { StructureBoard } from "@/components/admin/StructureBoard";
import { SiteHeader } from "@/components/SiteHeader";
import { currentUser, isEditor } from "@/lib/access";
import { structureWebhookConfigured } from "@/lib/discord";
import { getSettings, getStructureDocs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminStructurePage() {
  const user = await currentUser();
  if (!user) return <SignInScreen />;

  const allowed = await isEditor(user.id);
  if (!allowed) return <NotOnListScreen user={user} />;

  const [docs, settings] = await Promise.all([getStructureDocs(), getSettings()]);

  return (
    <>
      <SiteHeader user={user} canEdit title={settings.author_name || undefined} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <AdminTabs active="structure" />
        <StructureBoard docs={docs} settings={settings} webhookConfigured={structureWebhookConfigured()} />
      </main>
    </>
  );
}
