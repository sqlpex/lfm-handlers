"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import type { ActionResult } from "@/lib/actions";

type Status = { kind: "ok" | "error"; text: string } | null;

type Board = {
  /** Runs a server action, surfaces its result as a toast, resolves to whether it succeeded. */
  run: (action: Promise<ActionResult>) => Promise<boolean>;
  pending: boolean;
};

const Ctx = createContext<Board>({ run: async () => false, pending: false });

export function useBoard() {
  return useContext(Ctx);
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(null);
  const [pending, startTransition] = useTransition();

  const run = useCallback(
    (action: Promise<ActionResult>) =>
      new Promise<boolean>((resolve) => {
        startTransition(async () => {
          const result = await action;
          if (!result.ok) setStatus({ kind: "error", text: result.error });
          else if (result.message) setStatus({ kind: "ok", text: result.message });
          resolve(result.ok);
        });
      }),
    [],
  );

  useEffect(() => {
    if (!status || status.kind !== "ok") return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  return (
    <Ctx.Provider value={{ run, pending }}>
      {children}
      {status && (
        <div
          role="status"
          className={`fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg px-4 py-2.5 text-sm shadow-lg ${
            status.kind === "ok" ? "bg-[#248046] text-white" : "bg-[#da373c] text-white"
          }`}
        >
          <span>{status.text}</span>
          <button onClick={() => setStatus(null)} className="opacity-80 hover:opacity-100" aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}
      {pending && (
        <div className="pointer-events-none fixed top-0 left-0 z-50 h-0.5 w-full animate-pulse bg-[#5865F2]" />
      )}
    </Ctx.Provider>
  );
}
