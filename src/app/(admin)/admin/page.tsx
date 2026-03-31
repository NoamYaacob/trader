import { prisma } from "@/db/client";
import { auth } from "@/lib/auth";

// Formats a Date as "MMM D, YYYY" without any external library.
function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

export default async function AdminPage() {
  const session = await auth();

  const [
    userCount,
    strategyCount,
    playbookCount,
    setupCount,
    sessionCount,
    reviewCount,
    latestUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.strategy.count(),
    prisma.playbook.count(),
    prisma.setup.count(),
    prisma.trainingSession.count(),
    prisma.tradeReview.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take:    10,
      select:  { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const stats = [
    { label: "Users",             value: userCount     },
    { label: "Strategies",        value: strategyCount },
    { label: "Playbooks",         value: playbookCount },
    { label: "Setups",            value: setupCount    },
    { label: "Training sessions", value: sessionCount  },
    { label: "Trade reviews",     value: reviewCount   },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">

      {/* Header */}
      <div className="border-b border-border px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-[var(--accent-dim)] border border-[rgba(201,168,76,0.25)] flex items-center justify-center">
            <span className="text-accent font-bold" style={{ fontSize: 10 }}>T</span>
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-primary">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-muted font-mono">{session?.user?.email}</span>
          <a
            href="/dashboard"
            className="text-[12px] text-muted hover:text-secondary transition-colors font-mono"
          >
            ← App
          </a>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-8 py-10 flex flex-col gap-10">

        {/* Stats grid */}
        <div>
          <p className="text-[11px] font-mono text-muted uppercase tracking-widest mb-4">Overview</p>
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ label, value }) => (
              <div
                key={label}
                className="rounded border border-border bg-[var(--bg-surface)] px-5 py-4"
              >
                <p className="text-[28px] font-semibold text-primary leading-none mb-1">
                  {value.toLocaleString()}
                </p>
                <p className="text-[12px] text-muted font-mono">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Latest users */}
        <div>
          <p className="text-[11px] font-mono text-muted uppercase tracking-widest mb-4">
            Latest users
          </p>
          <div className="rounded border border-border overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-[var(--bg-surface)]">
                  <th className="text-left px-4 py-2.5 text-[11px] font-mono text-muted font-normal">Name</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-mono text-muted font-normal">Email</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-mono text-muted font-normal">Role</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-mono text-muted font-normal">Joined</th>
                </tr>
              </thead>
              <tbody>
                {latestUsers.map((user, i) => (
                  <tr
                    key={user.id}
                    className={i < latestUsers.length - 1 ? "border-b border-border" : ""}
                  >
                    <td className="px-4 py-3 text-primary">
                      {user.name ?? <span className="text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 text-secondary font-mono text-[12px]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          user.role === "ADMIN"
                            ? "text-[11px] font-mono text-accent border border-accent/30 rounded px-1.5 py-0.5"
                            : "text-[11px] font-mono text-muted border border-border rounded px-1.5 py-0.5"
                        }
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted font-mono text-[12px]">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
