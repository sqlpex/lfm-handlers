"use client";

import type { ReactNode } from "react";
import { createHandler, deleteFaction, reorderHandlers, updateFaction } from "@/lib/actions";
import type { TreeFaction } from "@/lib/queries";
import { useBoard } from "./BoardContext";
import { EditableText } from "./EditableText";
import { HandlerRow } from "./HandlerRow";
import { SortableList } from "./SortableList";
import { btnDanger, btnGhost } from "./ui";

export function FactionEditor({ faction, handle }: { faction: TreeFaction; handle: ReactNode }) {
  const { run } = useBoard();
  return (
    <div className="rounded-md border border-[#3f4147] bg-[#313338] p-3">
      <div className="flex items-center gap-2">
        {handle}
        <EditableText
          value={faction.name}
          placeholder="Faction name"
          className="flex-1 font-semibold !text-white"
          onSave={(name) => run(updateFaction(faction.id, { name }))}
        />
        <button type="button" className={btnGhost} onClick={() => run(createHandler(faction.id))}>
          + Handler
        </button>
        <button
          type="button"
          className={btnDanger}
          aria-label="Delete faction"
          onClick={() => {
            if (confirm(`Delete "${faction.name}" and its ${faction.handlers.length} handler(s)?`)) {
              run(deleteFaction(faction.id));
            }
          }}
        >
          Delete
        </button>
      </div>

      {faction.handlers.length > 0 ? (
        <SortableList
          items={faction.handlers}
          onReorder={(ids) => run(reorderHandlers(ids))}
          className="mt-2 space-y-1.5 pl-7"
          render={(h, hHandle) => <HandlerRow handler={h} handle={hHandle} />}
        />
      ) : (
        <p className="mt-2 pl-7 text-xs text-[#6d6f78]">No handlers yet.</p>
      )}
    </div>
  );
}
