import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Standalone layout for the admin area — no app sidebar.
// Enforces authentication + ADMIN role for every route in this group.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-[360px]">
          <div className="w-10 h-10 rounded-full border border-invalid/40 bg-invalid/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 5v4M8 11v.5" stroke="var(--color-invalid, #e05252)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="8" r="6.5" stroke="var(--color-invalid, #e05252)" strokeWidth="1.2" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-primary mb-1">Access denied</p>
            <p className="text-[13px] text-secondary leading-relaxed">
              You do not have permission to view this page.
            </p>
          </div>
          <a
            href="/dashboard"
            className="text-[12px] text-accent hover:text-primary transition-colors font-mono"
          >
            ← Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
