import { AdminBoard } from "@/components/admin/AdminBoard";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { NotOnListScreen, SignInScreen } from "@/components/admin/EditorGate";
import { SiteHeader } from "@/components/SiteHeader";
import { currentUser, envAdminIds, isEditor } from "@/lib/access";
import { handlersWebhookConfigured } from "@/lib/discord";
import { getEditors, getSettings, getTree } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) return <SignInScreen />;

  const allowed = await isEditor(user.id);
  if (!allowed) return <NotOnListScreen user={user} />;

  const [tree, editors, settings] = await Promise.all([getTree(), getEditors(), getSettings()]);

  return (
    <>
      <SiteHeader user={user} canEdit title={settings.author_name || undefined} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <AdminTabs active="handlers" />
        <AdminBoard
          tree={tree}
          editors={editors}
          envAdmins={envAdminIds()}
          settings={settings}
          meId={user.id}
          webhookConfigured={handlersWebhookConfigured()}
        />
      </main>
    </>
  );
}
