"use client";

import { DiscordEmbed } from "@/components/DiscordEmbed";
import type { Editor } from "@/db/schema";
import { createCategory, reorderCategories } from "@/lib/actions";
import type { Tree } from "@/lib/queries";
import { BoardProvider, useBoard } from "./BoardContext";
import { CategoryEditor } from "./CategoryEditor";
import { EditorsPanel } from "./EditorsPanel";
import { PostPanel } from "./PostPanel";
import { SettingsPanel } from "./SettingsPanel";
import { SortableList } from "./SortableList";
import { btnPrimary, panel, panelTitle, ROLE_SUGGESTIONS } from "./ui";

type Props = {
  tree: Tree;
  editors: Editor[];
  envAdmins: string[];
  settings: Record<string, string>;
  meId: string;
  webhookConfigured: boolean;
};

export function AdminBoard(props: Props) {
  return (
    <BoardProvider>
      <datalist id="role-options">
        {ROLE_SUGGESTIONS.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      <Board {...props} />
    </BoardProvider>
  );
}

function Board({ tree, editors, envAdmins, settings, meId, webhookConfigured }: Props) {
  const { run, pending } = useBoard();

  let messageCount = 0;
  try {
    messageCount = (JSON.parse(settings.discord_message_ids || "[]") as string[]).length;
  } catch {
    messageCount = 0;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_480px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Categories</h1>
          <button type="button" className={btnPrimary} disabled={pending} onClick={() => run(createCategory())}>
            + Add category
          </button>
        </div>
        {tree.length === 0 ? (
          <p className="text-sm text-[#949ba4]">Nothing here yet. Add a category to get started.</p>
        ) : (
          <SortableList
            items={tree}
            onReorder={(ids) => run(reorderCategories(ids))}
            className="space-y-4"
            render={(c, handle) => <CategoryEditor category={c} handle={handle} />}
          />
        )}
      </div>

      <aside className="space-y-4 self-start lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
        <PostPanel webhookConfigured={webhookConfigured} messageCount={messageCount} />

        <section className={`${panel} p-4`}>
          <h2 className={panelTitle}>Preview</h2>
          <p className="mt-1 text-xs text-[#949ba4]">This is what the webhook will post.</p>
          <div className="mt-3 space-y-3">
            {tree.map((category, i) => (
              <DiscordEmbed key={category.id} category={category} settings={settings} isLast={i === tree.length - 1} />
            ))}
          </div>
        </section>

        <SettingsPanel settings={settings} />
        <EditorsPanel editors={editors} envAdmins={envAdmins} meId={meId} />
      </aside>
    </div>
  );
}
