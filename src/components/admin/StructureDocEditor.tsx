"use client";

import type { ReactNode } from "react";
import { createStructureRole, deleteStructureDoc, reorderStructureRoles, updateStructureDocTitle } from "@/lib/actions";
import type { StructureTreeDoc } from "@/lib/queries";
import { useBoard } from "./BoardContext";
import { EditableText } from "./EditableText";
import { RoleEditor } from "./RoleEditor";
import { SortableList } from "./SortableList";
import { btnDanger, btnSecondary, panel, panelTitle } from "./ui";

export function StructureDocEditor({ doc, handle }: { doc: StructureTreeDoc; handle: ReactNode }) {
  const { run } = useBoard();

  return (
    <section className={`${panel} overflow-hidden`}>
      <div className="flex items-center gap-3 border-b border-[#3f4147] p-3">
        {handle}
        <EditableText
          value={doc.title}
          placeholder="Document title"
          className="flex-1 !text-lg font-semibold !text-white"
          onSave={(title) => run(updateStructureDocTitle(doc.id, title))}
        />
        <button
          type="button"
          className={btnDanger}
          onClick={() => {
            if (confirm(`Delete "${doc.title}" with its ${doc.roles.length} role(s)? This cannot be undone.`)) {
              run(deleteStructureDoc(doc.id));
            }
          }}
        >
          Delete
        </button>
      </div>

      <div className="space-y-3 p-3">
        <div className="flex items-center justify-between">
          <span className={panelTitle}>Roles</span>
          <button type="button" className={btnSecondary} onClick={() => run(createStructureRole(doc.id))}>
            + Add role
          </button>
        </div>
        {doc.roles.length > 0 ? (
          <SortableList
            items={doc.roles}
            onReorder={(ids) => run(reorderStructureRoles(ids))}
            className="space-y-2"
            render={(role, rHandle) => <RoleEditor role={role} handle={rHandle} />}
          />
        ) : (
          <p className="text-sm text-[#6d6f78]">No roles in this document yet.</p>
        )}
      </div>
    </section>
  );
}
