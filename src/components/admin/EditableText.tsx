"use client";

import { useState } from "react";
import { input } from "./ui";

type Props = {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  list?: string;
  ariaLabel?: string;
};

/** Text field that saves on blur (or Enter for single-line) and resets on Escape. */
export function EditableText({ value, onSave, placeholder, className, multiline, list, ariaLabel }: Props) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setDraft(value);
  }

  const commit = () => {
    if (draft.trim() !== value.trim()) onSave(draft);
  };

  const shared = {
    value: draft,
    placeholder,
    "aria-label": ariaLabel ?? placeholder,
    className: `${input} ${className ?? ""}`,
    onBlur: commit,
  };

  if (multiline) {
    return (
      <textarea
        {...shared}
        rows={Math.min(8, Math.max(2, draft.split("\n").length + 1))}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setDraft(value);
        }}
      />
    );
  }

  return (
    <input
      {...shared}
      list={list}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") {
          setDraft(value);
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}
