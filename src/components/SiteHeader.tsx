/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { signInWithDiscord, signOutAction } from "@/lib/actions";
import type { CurrentUser } from "@/lib/access";

type Props = { user: CurrentUser | null; canEdit: boolean; title?: string };

export function SiteHeader({ user, canEdit, title = "Legal Faction Management" }: Props) {
  return (
    <header className="border-b border-[#1e1f22] bg-[#2b2d31]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3 text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#5865F2] text-sm font-bold">
            LFM
          </span>
          <span className="font-semibold">{title}</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-[#b5bac1] hover:text-white">
            Handlers
          </Link>
          <Link href="/structure" className="text-[#b5bac1] hover:text-white">
            Structure
          </Link>
          {canEdit && (
            <Link href="/admin" className="text-[#b5bac1] hover:text-white">
              Admin
            </Link>
          )}
          {user ? (
            <form action={signOutAction} className="flex items-center gap-2">
              {user.image && <img src={user.image} alt="" className="h-6 w-6 rounded-full" />}
              <span className="hidden text-[#dbdee1] sm:inline">{user.name}</span>
              <button className="rounded bg-[#4e5058] px-3 py-1.5 text-white hover:bg-[#6d6f78]">
                Sign out
              </button>
            </form>
          ) : (
            <form action={signInWithDiscord}>
              <button className="rounded bg-[#5865F2] px-3 py-1.5 font-medium text-white hover:bg-[#4752c4]">
                Sign in with Discord
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
