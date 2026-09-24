import Link from "next/link";

type Props = { active: "handlers" | "structure" };

export function AdminTabs({ active }: Props) {
  const tabs = [
    { key: "handlers", label: "Handlers", href: "/admin" },
    { key: "structure", label: "LFM Structure", href: "/admin/structure" },
  ] as const;

  return (
    <div className="mb-4 flex gap-1 border-b border-[#3f4147]">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`border-b-2 px-3 py-2 text-sm font-medium transition ${
            active === tab.key
              ? "border-[#5865F2] text-white"
              : "border-transparent text-[#949ba4] hover:text-white"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
