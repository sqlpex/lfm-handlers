"use client";

import type { ReactNode } from "react";
import { deleteHandler, updateHandler } from "@/lib/actions";
import type { TreeHandler } from "@/lib/queries";
import { useBoard } from "./BoardContext";
import { EditableText } from "./EditableText";
import { RoleSelect } from "./RoleSelect";
import { btnDanger } from "./ui";

export function HandlerRow({ handler, handle }: { handler: TreeHandler; handle: ReactNode }) {
  const { run } = useBoard();
  return (
    <div className="flex items-center gap-2">
      {handle}
      <RoleSelect value={handler.role} onSave={(role) => run(updateHandler(handler.id, { role }))} />
      <span className="text-[#6d6f78]">:</span>
      <EditableText
        value={handler.name}
        placeholder="Discord name"
        className="flex-1"
        onSave={(name) => run(updateHandler(handler.id, { name }))}
      />
      <button
        type="button"
        className={btnDanger}
        aria-label="Remove handler"
        onClick={() => {
          if (confirm(`Remove ${handler.role} ${handler.name || "(unnamed)"}?`)) run(deleteHandler(handler.id));
        }}
      >
        ✕
      </button>
    </div>
  );
}
