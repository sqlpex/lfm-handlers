/* eslint-disable @next/next/no-img-element */
import { buildEmbed, type CategoryLike, type EmbedSettings } from "@/lib/embed";
import { Markdown } from "./Markdown";

type Props = {
  category: CategoryLike;
  settings: EmbedSettings;
  isLast?: boolean;
  timestamp?: string;
};

/** Renders a category the way Discord renders the embed the webhook will send. */
export function DiscordEmbed({ category, settings, isLast = false, timestamp }: Props) {
  const embed = buildEmbed(category, settings, {
    isLast,
    timestamp: timestamp ?? new Date().toISOString(),
  });
  const color = category.color || "#5865F2";

  return (
    <article className="flex max-w-[520px] overflow-hidden rounded bg-[#2b2d31] text-[#dbdee1]">
      <div className="w-1 shrink-0" style={{ backgroundColor: color }} aria-hidden />
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
          {embed.description && (
            <p className="whitespace-pre-wrap text-sm leading-[1.375rem]">
              <Markdown text={embed.description} />
            </p>
          )}
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
          <img
            src={embed.thumbnail.url}
            alt=""
            className="h-20 w-20 shrink-0 rounded object-cover"
          />
        )}
      </div>
    </article>
  );
}
