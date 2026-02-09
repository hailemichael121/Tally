import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

const pin = "041221";

const users = [
  {
    id: "yihun",
    name: "Yihun",
    loveName: "Shebeto",
    accent: "text-blush",
    emoji: "🌙",
  },
  {
    id: "tekta",
    name: "Tekta",
    loveName: "Shefafait",
    accent: "text-cocoa",
    emoji: "🌤️",
  },
];

const weekSummary = {
  weekLabel: "Week of Sep 2",
  totals: {
    yihun: 12,
    tekta: 9,
  },
  winner: "yihun",
};

const dailyBreakdown = [
  {
    date: "Mon, Sep 2",
    entries: [
      { id: 1, user: "yihun", count: 2, note: "Coffee shop hello" },
      { id: 2, user: "tekta", count: 1, note: "Grocery aisle talk" },
    ],
  },
  {
    date: "Tue, Sep 3",
    entries: [
      { id: 3, user: "yihun", count: 3, note: "Gym check-in" },
      { id: 4, user: "tekta", count: 2, note: "Morning commute" },
    ],
  },
];

export default function App() {
  const [pinValue, setPinValue] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const handlePinSubmit = () => {
    if (pinValue === pin) {
      setUnlocked(true);
    } else {
      setPinValue("");
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      {!unlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur">
          <div className="glass-card w-[90%] max-w-sm rounded-3xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">PIN</p>
                <h1 className="mt-2 text-2xl font-semibold">Enter the shared key</h1>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-lg">🔒</div>
            </div>
            <input
              value={pinValue}
              onChange={(event) => setPinValue(event.target.value)}
              type="password"
              inputMode="numeric"
              placeholder="041221"
              className="soft-input mt-6 w-full text-center text-xl tracking-[0.3em]"
            />
            <button
              onClick={handlePinSubmit}
              className="mt-6 w-full rounded-2xl bg-blush/80 py-3 text-sm font-semibold text-ink shadow-floaty"
            >
              Unlock
            </button>
            <p className="mt-4 text-center text-xs text-white/50">
              Intentional, not complicated. This space is just for the two of you.
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-24 pt-10 sm:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Weekly focus</p>
              <h1 className="mt-2 text-3xl font-semibold text-mist">Quiet tally</h1>
              <p className="mt-2 text-sm text-white/60">
                Track the weekly story with gentle structure and soft transparency.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 text-lg">💗</div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-white/60">
            <span className="rounded-full border border-white/10 px-3 py-1">{weekSummary.weekLabel}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">PIN protected</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Shared visibility</span>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="glass-card rounded-3xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Current week overview</h2>
              <span className="text-xs text-white/50">Totals reset every Monday</span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/50">{user.name}</p>
                      <h3 className={clsx("text-xl font-semibold", user.accent)}>
                        {user.loveName}
                      </h3>
                    </div>
                    <span className="text-2xl">{user.emoji}</span>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-3xl font-semibold">
                      {weekSummary.totals[user.id as keyof typeof weekSummary.totals]}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                      total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-3xl p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Winner</p>
                <h2 className="mt-2 text-2xl font-semibold">Weekly glow</h2>
                <p className="mt-2 text-sm text-white/60">
                  A soft nudge, not a race. Badge resets each week.
                </p>
              </div>
              <span className="text-lg">✨</span>
            </div>
            <motion.div
              className="mt-6 rounded-3xl border border-blush/20 bg-blush/10 p-4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/50">This week</p>
                  <h3 className="text-xl font-semibold text-blush">{users[0].loveName}</h3>
                </div>
                <span className="rounded-2xl bg-white/10 px-3 py-2 text-lg">🏆</span>
              </div>
              <div className="mt-3 text-xs text-white/50">
                Soft celebration: scale + fade, confetti-lite.
              </div>
            </motion.div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Comparison</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-white/70">Shebeto vs Shefafait</span>
                <span className="text-blush">+3</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 w-3/5 rounded-full bg-blush/70" />
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-3xl p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Daily breakdown</h2>
            <button className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/70">
              Week selector
            </button>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            {dailyBreakdown.map((day) => (
              <div key={day.date} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">{day.date}</p>
                <div className="mt-4 flex flex-col gap-3">
                  {day.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm">
                          {entry.user === "yihun" ? "Shebeto" : "Shefafait"}
                        </p>
                        <p className="text-xs text-white/50">{entry.note}</p>
                      </div>
                      <span className="text-lg font-semibold">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Add entry</p>
              <h2 className="mt-2 text-lg font-semibold">Soft capture</h2>
            </div>
            <span className="rounded-2xl bg-white/10 px-3 py-2 text-lg">📝</span>
          </div>
          <form className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <input className="soft-input" placeholder="Note for the moment" />
            <input className="soft-input" placeholder="Count" type="number" min={1} />
            <button className="rounded-2xl bg-cocoa px-6 py-3 text-sm font-semibold text-mist">
              Save
            </button>
          </form>
          <p className="mt-4 text-xs text-white/50">
            Users can only edit their own entries. Both can view each other.
          </p>
        </section>
      </main>

      <nav className="fixed bottom-4 left-1/2 z-40 w-[92%] max-w-sm -translate-x-1/2 rounded-3xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>Dashboard</span>
          <span>New</span>
          <span>History</span>
        </div>
      </nav>
    </div>
  );
}
