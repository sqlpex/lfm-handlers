import type { ReactNode } from "react";

const TOKEN =
  /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\*[^*\n]+\*|_[^_\n]+_)/g;

function render(text: string, keyPrefix = ""): ReactNode[] {
  const re = new RegExp(TOKEN.source, "g");
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}${i++}`;
    if (tok.startsWith("**")) {
      out.push(<strong key={key} className="font-semibold text-white">{render(tok.slice(2, -2), key)}</strong>);
    } else if (tok.startsWith("__")) {
      out.push(<u key={key}>{render(tok.slice(2, -2), key)}</u>);
    } else if (tok.startsWith("~~")) {
      out.push(<s key={key}>{render(tok.slice(2, -2), key)}</s>);
    } else if (tok.startsWith("`")) {
      out.push(
        <code key={key} className="rounded bg-[#1e1f22] px-1 py-0.5 font-mono text-[0.85em]">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("[")) {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      if (link) {
        out.push(
          <a key={key} href={link[2]} target="_blank" rel="noreferrer" className="text-[#00a8fc] hover:underline">
            {render(link[1], key)}
          </a>,
        );
      } else {
        out.push(tok);
      }
    } else {
      out.push(<em key={key}>{render(tok.slice(1, -1), key)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Renders the subset of Discord markdown used in embeds: bold, italic, underline, strike, code, links. */
export function Markdown({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{render(text)}</span>;
}
