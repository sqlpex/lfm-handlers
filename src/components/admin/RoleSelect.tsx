"use client";

import { useState } from "react";
import { input, ROLE_SUGGESTIONS } from "./ui";

const CUSTOM = "__custom__";

type Props = { value: string; onSave: (value: string) => void };

/** Dropdown of the standard handler roles, with a "Custom…" option that reveals a text field. */
export function RoleSelect({ value, onSave }: Props) {
  const isPreset = (ROLE_SUGGESTIONS as readonly string[]).includes(value);
  const [customDraft, setCustomDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setCustomDraft(value);
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={isPreset ? value : CUSTOM}
        aria-label="Role"
        className={`${input} !w-auto`}
        onChange={(e) => {
          if (e.target.value === CUSTOM) {
            setCustomDraft(isPreset ? "" : value);
            return;
          }
          onSave(e.target.value);
        }}
      >
        {ROLE_SUGGESTIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
        <option value={CUSTOM}>Custom…</option>
      </select>
      {!isPreset && (
        <input
          value={customDraft}
          placeholder="Custom role"
          aria-label="Custom role"
          className={`${input} !w-36`}
          onChange={(e) => setCustomDraft(e.target.value)}
          onBlur={() => {
            if (customDraft.trim() && customDraft !== value) onSave(customDraft);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
        />
      )}
    </div>
  );
}
