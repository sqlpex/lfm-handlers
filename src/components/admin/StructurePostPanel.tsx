"use client";

import { EmbedCard } from "@/components/EmbedCard";
import { forgetStructureDiscordMessage, postStructureDocToDiscord, updateStructureDocWebhook } from "@/lib/actions";
import { buildRoleEmbeds } from "@/lib/embed";
import type { StructureTreeDoc } from "@/lib/queries";
import { useBoard } from "./BoardContext";
import { EditableText } from "./EditableText";
import { btnGhost, btnPrimary, panel, panelTitle } from "./ui";

type Props = { doc: StructureTreeDoc; settings: Record<string, string> };

export function StructurePostPanel({ doc, settings }: Props) {
  const { run, pending } = useBoard();
  const webhookConfigured = Boolean(doc.webhookUrl);

  let messageCount = 0;
  try {
    messageCount = (JSON.parse(doc.discordMessageIds || "[]") as string[]).length;
  } catch {
    messageCount = 0;
  }

  const embeds = buildRoleEmbeds(doc.roles, settings);

  return (
    <section className={`${panel} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={panelTitle}>{doc.title}</h2>
          <p className="mt-1 text-sm text-[#b5bac1]">
            {!webhookConfigured
              ? "Set a webhook below to enable posting."
              : messageCount > 0
                ? `Will edit the existing message${messageCount > 1 ? "s" : ""} in place.`
                : "Will post a new message to the channel."}
          </p>
        </div>
        <button
          type="button"
          className={btnPrimary}
          disabled={!webhookConfigured || pending || doc.roles.length === 0}
          onClick={() => run(postStructureDocToDiscord(doc.id))}
        >
          Post to Discord
        </button>
      </div>

      <label className="mt-3 block space-y-1">
        <span className="text-xs text-[#b5bac1]">
          This document&apos;s Discord webhook URL
        </span>
        <EditableText
          value={doc.webhookUrl ?? ""}
          placeholder="https://discord.com/api/webhooks/..."
          onSave={(webhookUrl) => run(updateStructureDocWebhook(doc.id, webhookUrl))}
        />
      </label>

      {messageCount > 0 && (
        <button
          type="button"
          className={`${btnGhost} mt-2 !px-0 text-xs`}
          onClick={() => {
            if (
              confirm(
                "Forget the current Discord message? The next post will create a new one and the old one stays in the channel.",
              )
            ) {
              run(forgetStructureDiscordMessage(doc.id));
            }
          }}
        >
          Post as a new message next time
        </button>
      )}
      <div className="mt-3 space-y-3">
        {embeds.length === 0 ? (
          <p className="text-xs text-[#6d6f78]">Add a role to see a preview.</p>
        ) : (
          embeds.map((embed, i) => <EmbedCard key={doc.roles[i].id} embed={embed} color={doc.roles[i].color} />)
        )}
      </div>
    </section>
  );
}
