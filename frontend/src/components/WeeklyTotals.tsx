import { User, WeeklySummary } from "../types";
import { IconSparkle } from "./Icons";
import clsx from "clsx";

interface WeeklyTotalsProps {
  activeUserId: string;
  users: User[];
  weeklySummary: WeeklySummary | null;
}

export default function WeeklyTotals({
  activeUserId,
  users,
  weeklySummary,
}: WeeklyTotalsProps) {
  // Filter out judge and yeabsra
  const displayUsers = users.filter(
    (user) => user.id !== "judge" && user.id !== "yeabsra",
  );

  const displayTotals = displayUsers.map((user) => ({
    user,
    total: weeklySummary ? (weeklySummary.totals[user.id] ?? 0) : 0,
    accent: user.id === activeUserId ? "text-white" : "text-cocoa",
  }));

  return (
    <div className="glass-card rounded-3xl p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Weekly Totals</h2>
        <span className="text-xs text-white/50">Side-by-side</span>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {displayTotals.map(({ user, total, accent }) => (
          <div
            key={user.id}
            className={clsx(
              "rounded-3xl border bg-white/5 p-4 transition-colors hover:bg-white/10",
              user.id === activeUserId ? "border-white/40" : "border-white/10",
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">{user.name}</p>
                <h3 className={clsx("text-xl font-semibold", accent)}>
                  {user.loveName}
                </h3>
              </div>
              <span className="text-2xl text-white/70">
                <IconSparkle />
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-semibold">{total}</span>
              <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                total
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
