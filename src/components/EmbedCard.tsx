/* eslint-disable @next/next/no-img-element */
import type { DiscordEmbed } from "@/lib/embed";
import { EmbedDescription } from "./Markdown";

type Props = { embed: DiscordEmbed; color: string };

/** Renders an already-built embed the way Discord renders the webhook message. */
export function EmbedCard({ embed, color }: Props) {
  return (
    <article className="flex max-w-[520px] overflow-hidden rounded bg-[#2b2d31] text-[#dbdee1]">
      <div className="w-1 shrink-0" style={{ backgroundColor: color || "#5865F2" }} aria-hidden />
      <div className="flex min-w-0 flex-1 gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          {embed.author && (
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              {embed.author.icon_url && (
                <img src={embed.author.icon_url} alt="" className="h-6 w-6 rounded-full object-cover" />
              )}
              <span className="truncate">{embed.author.name}</span>
            </div>
          )}
          <h3 className="mb-2 text-base font-semibold text-white">{embed.title}</h3>
          {embed.description && <EmbedDescription text={embed.description} />}
          {embed.footer && (
            <div className="mt-2 flex items-center gap-1 text-xs text-[#949ba4]">
              <span>{embed.footer.text}</span>
              {embed.timestamp && (
                <>
                  <span aria-hidden>•</span>
                  <time dateTime={embed.timestamp} suppressHydrationWarning>
                    {new Date(embed.timestamp).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </>
              )}
            </div>
          )}
        </div>
        {embed.thumbnail && (
          <img src={embed.thumbnail.url} alt="" className="h-20 w-20 shrink-0 rounded object-cover" />
        )}
      </div>
    </article>
  );
}
