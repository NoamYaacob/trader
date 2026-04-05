"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Platform",
    items: [
      { label: "Dashboard",     href: "/dashboard" },
      { label: "Playbook",      href: "/playbook" },
      { label: "Pine Script",   href: "/pine-script" },
      { label: "Setup Library", href: "/setups" },
    ],
  },
  {
    label: "Workflow",
    items: [
      { label: "Training",      href: "/training" },
      { label: "Trade Review",  href: "/reviews" },
    ],
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 flex flex-col h-screen sticky top-0 border-r border-border bg-base">

      {/* Wordmark */}
      <div className="h-14 flex items-center px-4 shrink-0 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.25)] flex items-center justify-center shrink-0">
            <span className="rule-text text-accent" style={{ fontSize: 10, fontWeight: 700 }}>T</span>
          </div>
          <span className="text-[14px] font-semibold text-primary tracking-tight">Trader</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pt-4 pb-2">
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.label} className={cn("mb-1", si > 0 && "mt-4 pt-4 border-t border-border")}>
            <p className="label-section px-4 mb-1">{section.label}</p>
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center h-8 mx-2 px-2.5 rounded-sm text-[13px] transition-colors duration-150",
                    active
                      ? "text-primary bg-[var(--accent-dim)] border-l-2 border-accent"
                      : "text-secondary hover:text-primary hover:bg-elevated"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User area */}
      <div className="shrink-0 h-14 border-t border-border flex items-center px-4 gap-2.5">
        <div className="w-6 h-6 rounded-sm bg-elevated border border-border-strong flex items-center justify-center shrink-0">
          <span className="rule-text text-secondary" style={{ fontSize: 10 }}>—</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] text-secondary truncate leading-none">Account</span>
          <span className="text-[10px] text-muted truncate leading-none mt-0.5">Phase 1 preview</span>
        </div>
      </div>

    </aside>
  );
}
