"use client";

import { forgetDiscordMessage, postToDiscord } from "@/lib/actions";
import { useBoard } from "./BoardContext";
import { btnGhost, btnPrimary, panel, panelTitle } from "./ui";

type Props = { webhookConfigured: boolean; messageCount: number };

export function PostPanel({ webhookConfigured, messageCount }: Props) {
  const { run, pending } = useBoard();

  return (
    <section className={`${panel} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={panelTitle}>Discord</h2>
          <p className="mt-1 text-sm text-[#b5bac1]">
            {!webhookConfigured
              ? "Set DISCORD_WEBHOOK_URL in the environment to enable posting."
              : messageCount > 0
                ? `Will edit the existing message${messageCount > 1 ? "s" : ""} in place.`
                : "Will post a new message to the channel."}
          </p>
        </div>
        <button
          type="button"
          className={btnPrimary}
          disabled={!webhookConfigured || pending}
          onClick={() => run(postToDiscord())}
        >
          Post to Discord
        </button>
      </div>
      {messageCount > 0 && (
        <button
          type="button"
          className={`${btnGhost} mt-2 !px-0 text-xs`}
          onClick={() => {
            if (confirm("Forget the current Discord message? The next post will create a new one and the old one stays in the channel.")) {
              run(forgetDiscordMessage());
            }
          }}
        >
          Post as a new message next time
        </button>
      )}
    </section>
  );
}
