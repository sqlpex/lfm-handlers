"use client";

import { createStructureDoc, reorderStructureDocs } from "@/lib/actions";
import type { StructureTree } from "@/lib/queries";
import { BoardProvider, useBoard } from "./BoardContext";
import { SortableList } from "./SortableList";
import { StructureDocEditor } from "./StructureDocEditor";
import { StructurePostPanel } from "./StructurePostPanel";
import { btnPrimary } from "./ui";

type Props = { docs: StructureTree; settings: Record<string, string>; webhookConfigured: boolean };

export function StructureBoard(props: Props) {
  return (
    <BoardProvider>
      <Board {...props} />
    </BoardProvider>
  );
}

function Board({ docs, settings, webhookConfigured }: Props) {
  const { run, pending } = useBoard();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_480px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">LFM Structure</h1>
          <button type="button" className={btnPrimary} disabled={pending} onClick={() => run(createStructureDoc())}>
            + Add document
          </button>
        </div>
        {docs.length === 0 ? (
          <p className="text-sm text-[#949ba4]">Nothing here yet. Add a document to get started.</p>
        ) : (
          <SortableList
            items={docs}
            onReorder={(ids) => run(reorderStructureDocs(ids))}
            className="space-y-4"
            render={(doc, handle) => <StructureDocEditor doc={doc} handle={handle} />}
          />
        )}
      </div>

      <aside className="space-y-4 self-start lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
        {docs.map((doc) => (
          <StructurePostPanel key={doc.id} doc={doc} settings={settings} webhookConfigured={webhookConfigured} />
        ))}
      </aside>
    </div>
  );
}
