"use client";

import { useState } from "react";
import { addEditor, removeEditor } from "@/lib/actions";
import type { Editor } from "@/db/schema";
import { useBoard } from "./BoardContext";
import { btnDanger, btnSecondary, input, panel, panelTitle } from "./ui";

type Props = { editors: Editor[]; envAdmins: string[]; meId: string };

export function EditorsPanel({ editors, envAdmins, meId }: Props) {
  const { run, pending } = useBoard();
  const [discordId, setDiscordId] = useState("");
  const [label, setLabel] = useState("");

  return (
    <section className={`${panel} p-4`}>
      <h2 className={panelTitle}>Editors</h2>
      <p className="mt-1 text-xs text-[#949ba4]">
        People who can open this page. Discord user IDs: enable Developer Mode in Discord, right-click a user, Copy User ID.
      </p>

      <ul className="mt-3 divide-y divide-[#3f4147] text-sm">
        {envAdmins.map((id) => (
          <li key={`env-${id}`} className="flex items-center justify-between gap-2 py-2">
            <div>
              <span className="font-mono text-[#dbdee1]">{id}</span>
              {id === meId && <span className="ml-2 text-xs text-[#949ba4]">(you)</span>}
              <div className="text-xs text-[#949ba4]">Permanent, set in ADMIN_DISCORD_IDS</div>
            </div>
          </li>
        ))}
        {editors.map((e) => (
          <li key={e.discordId} className="flex items-center justify-between gap-2 py-2">
            <div className="min-w-0">
              <span className="text-white">{e.label || "Unnamed"}</span>
              {e.discordId === meId && <span className="ml-2 text-xs text-[#949ba4]">(you)</span>}
              <div className="truncate font-mono text-xs text-[#949ba4]">
                {e.discordId}
                {e.addedBy ? ` · added by ${e.addedBy}` : ""}
              </div>
            </div>
            <button
              type="button"
              className={btnDanger}
              disabled={e.discordId === meId || pending}
              onClick={() => {
                if (confirm(`Remove ${e.label || e.discordId} from the editor list?`)) run(removeEditor(e.discordId));
              }}
            >
              Remove
            </button>
          </li>
        ))}
        {editors.length === 0 && envAdmins.length === 0 && (
          <li className="py-2 text-xs text-[#949ba4]">No editors configured.</li>
        )}
      </ul>

      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={async (e) => {
          e.preventDefault();
          const ok = await run(addEditor(discordId, label));
          if (ok) {
            setDiscordId("");
            setLabel("");
          }
        }}
      >
        <input
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
          placeholder="Discord user ID"
          className={`${input} font-mono`}
          required
          pattern="\d{15,22}"
          title="A Discord user ID is a 17 to 20 digit number"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Name (for your reference)"
          className={input}
        />
        <button type="submit" className={`${btnSecondary} shrink-0`} disabled={pending}>
          Add editor
        </button>
      </form>
    </section>
  );
}
