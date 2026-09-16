import { AdminBoard } from "@/components/admin/AdminBoard";
import { SiteHeader } from "@/components/SiteHeader";
import { currentUser, envAdminIds, isEditor } from "@/lib/access";
import { signInWithDiscord } from "@/lib/actions";
import { webhookConfigured } from "@/lib/discord";
import { getEditors, getSettings, getTree } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <>
        <SiteHeader user={null} canEdit={false} />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-white">Editor sign-in</h1>
          <p className="mt-2 text-sm text-[#b5bac1]">
            Sign in with the Discord account that is on the Legal Faction Management editor list.
          </p>
          <form action={signInWithDiscord} className="mt-6">
            <button className="rounded bg-[#5865F2] px-5 py-2.5 font-medium text-white hover:bg-[#4752c4]">
              Sign in with Discord
            </button>
          </form>
        </main>
      </>
    );
  }

  const allowed = await isEditor(user.id);
  if (!allowed) {
    return (
      <>
        <SiteHeader user={user} canEdit={false} />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-white">Not on the editor list</h1>
          <p className="mt-2 text-sm text-[#b5bac1]">
            You are signed in as <span className="text-white">{user.name}</span>, but this account cannot edit.
            Send an existing editor your Discord user ID so they can add you:
          </p>
          <code className="mt-4 rounded bg-[#1e1f22] px-3 py-2 font-mono text-sm text-white select-all">{user.id}</code>
        </main>
      </>
    );
  }

  const [tree, editors, settings] = await Promise.all([getTree(), getEditors(), getSettings()]);

  return (
    <>
      <SiteHeader user={user} canEdit title={settings.author_name || undefined} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <AdminBoard
          tree={tree}
          editors={editors}
          envAdmins={envAdminIds()}
          settings={settings}
          meId={user.id}
          webhookConfigured={webhookConfigured()}
        />
      </main>
    </>
  );
}
