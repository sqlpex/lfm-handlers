"use client";

import { useState, type ReactNode } from "react";
import { deleteStructureRole, updateStructureRole } from "@/lib/actions";
import type { StructureTreeRole } from "@/lib/queries";
import { useBoard } from "./BoardContext";
import { EditableText } from "./EditableText";
import { btnDanger, panelTitle } from "./ui";

export function RoleEditor({ role, handle }: { role: StructureTreeRole; handle: ReactNode }) {
  const { run } = useBoard();
  const [color, setColor] = useState(role.color);
  const [syncedColor, setSyncedColor] = useState(role.color);
  if (syncedColor !== role.color) {
    setSyncedColor(role.color);
    setColor(role.color);
  }

  return (
    <div className="rounded-md border border-[#3f4147] bg-[#313338] p-3" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="flex items-center gap-2">
        {handle}
        <input
          type="color"
          value={color}
          aria-label="Embed colour"
          className="h-8 w-8 cursor-pointer"
          onChange={(e) => setColor(e.target.value)}
          onBlur={() => {
            if (color !== role.color) run(updateStructureRole(role.id, { color }));
          }}
        />
        <EditableText
          value={role.name}
          placeholder="Role name"
          className="flex-1 font-semibold !text-white"
          onSave={(name) => run(updateStructureRole(role.id, { name }))}
        />
        <button
          type="button"
          className={btnDanger}
          onClick={() => {
            if (confirm(`Delete the "${role.name}" role?`)) run(deleteStructureRole(role.id));
          }}
        >
          Delete
        </button>
      </div>

      <div className="mt-2 space-y-2 pl-7">
        <label className="block space-y-1">
          <span className={panelTitle}>Thumbnail image URL (optional)</span>
          <EditableText
            value={role.thumbnailUrl ?? ""}
            placeholder="https://..."
            onSave={(thumbnailUrl) => run(updateStructureRole(role.id, { thumbnailUrl }))}
          />
        </label>
        <label className="block space-y-1">
          <span className={panelTitle}>Body — supports **bold** and &quot;- &quot; bullet lines</span>
          <EditableText
            multiline
            maxRows={20}
            value={role.body}
            placeholder={"Intro paragraph.\n\n- Responsibility one\n- Responsibility two"}
            onSave={(body) => run(updateStructureRole(role.id, { body }))}
          />
        </label>
      </div>
    </div>
  );
}
