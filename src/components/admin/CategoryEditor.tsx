"use client";

import { useState, type ReactNode } from "react";
import { createFaction, deleteCategory, reorderFactions, updateCategory } from "@/lib/actions";
import type { TreeCategory } from "@/lib/queries";
import { useBoard } from "./BoardContext";
import { EditableText } from "./EditableText";
import { FactionEditor } from "./FactionEditor";
import { SortableList } from "./SortableList";
import { btnDanger, btnSecondary, panel, panelTitle } from "./ui";

export function CategoryEditor({ category, handle }: { category: TreeCategory; handle: ReactNode }) {
  const { run } = useBoard();
  const [color, setColor] = useState(category.color);
  const [syncedColor, setSyncedColor] = useState(category.color);
  if (syncedColor !== category.color) {
    setSyncedColor(category.color);
    setColor(category.color);
  }

  return (
    <section className={`${panel} overflow-hidden`}>
      <div className="flex items-center gap-3 border-b border-[#3f4147] p-3" style={{ borderLeft: `4px solid ${color}` }}>
        {handle}
        <input
          type="color"
          value={color}
          aria-label="Embed colour"
          className="h-8 w-8 cursor-pointer"
          onChange={(e) => setColor(e.target.value)}
          onBlur={() => {
            if (color !== category.color) run(updateCategory(category.id, { color }));
          }}
        />
        <EditableText
          value={category.name}
          placeholder="Category name"
          className="flex-1 !text-lg font-semibold !text-white"
          onSave={(name) => run(updateCategory(category.id, { name }))}
        />
        <button
          type="button"
          className={btnDanger}
          onClick={() => {
            if (
              confirm(
                `Delete "${category.name}" with its ${category.factions.length} faction(s)? This cannot be undone.`,
              )
            ) {
              run(deleteCategory(category.id));
            }
          }}
        >
          Delete
        </button>
      </div>

      <div className="space-y-4 p-3">
        <label className="block space-y-1">
          <span className={panelTitle}>Intro text</span>
          <EditableText
            multiline
            value={category.description}
            placeholder="Shown above the faction list. Supports **bold** and [links](https://...)."
            onSave={(description) => run(updateCategory(category.id, { description }))}
          />
        </label>

        <label className="block space-y-1">
          <span className={panelTitle}>Thumbnail image URL (optional)</span>
          <EditableText
            value={category.thumbnailUrl ?? ""}
            placeholder="https://..."
            onSave={(thumbnailUrl) => run(updateCategory(category.id, { thumbnailUrl }))}
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={panelTitle}>Factions</span>
            <button type="button" className={btnSecondary} onClick={() => run(createFaction(category.id))}>
              + Add faction
            </button>
          </div>
          {category.factions.length > 0 ? (
            <SortableList
              items={category.factions}
              onReorder={(ids) => run(reorderFactions(ids))}
              className="space-y-2"
              render={(f, fHandle) => <FactionEditor faction={f} handle={fHandle} />}
            />
          ) : (
            <p className="text-sm text-[#6d6f78]">No factions in this category yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
