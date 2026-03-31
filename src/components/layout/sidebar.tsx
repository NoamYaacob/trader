"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Platform",
    items: [
      { label: "Dashboard",      href: "/dashboard" },
      { label: "Playbook",       href: "/playbook" },
      { label: "Setup Library",  href: "/setups" },
    ],
  },
  {
    label: "Workflow",
    items: [
      { label: "Train",          href: "/train" },
      { label: "Trade Review",   href: "/review" },
    ],
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 flex flex-col h-screen sticky top-0 border-r border-border bg-base">
      {/* Wordmark */}
      <div className="h-14 flex items-center px-4 shrink-0">
        <span className="text-[15px] font-bold text-primary tracking-tight">
          Trader
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="label-section px-4 py-1.5">{section.label}</p>
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center h-[34px] mx-1 px-3 rounded text-[13px] transition-colors duration-150",
                    active
                      ? "text-primary bg-[var(--accent-dim)] border-l-2 border-accent pl-[10px]"
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

      {/* Bottom user area placeholder */}
      <div className="shrink-0 h-14 border-t border-border flex items-center px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-sm bg-elevated border border-border-strong flex items-center justify-center">
            <span className="text-[10px] font-mono text-muted">T</span>
          </div>
          <span className="text-[12px] text-secondary">Trader</span>
        </div>
      </div>
    </aside>
  );
}
