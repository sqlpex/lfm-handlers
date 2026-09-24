import type { CurrentUser } from "@/lib/access";
import { signInWithDiscord } from "@/lib/actions";
import { SiteHeader } from "@/components/SiteHeader";

/** Shown when nobody is signed in. Shared by every /admin* page. */
export function SignInScreen() {
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

/** Shown when someone is signed in with Discord but isn't on the editor list. */
export function NotOnListScreen({ user }: { user: CurrentUser }) {
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
