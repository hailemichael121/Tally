import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Entry, User } from "../types";

type CampaignCountdownProps = {
  entries: Entry[];
  users: User[];
  activeUserId: string;
};

type CampaignInsights = {
  weekLabel: string;
  weekRange: string;
  totalsByUser: Array<{ userId: string; name: string; total: number }>;
  winner?: { userId: string; name: string; total: number };
  loser?: { userId: string; name: string; total: number };
  bestDay?: { day: string; total: number };
  mentions: Array<{ name: string; count: number }>;
};

const MONDAY_MODAL_STORAGE = "tally-monday-modal-week";

const dayLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);

const shortDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    date,
  );

const getNextMondayNoon = () => {
  const now = new Date();
  const target = new Date(now);
  const day = now.getDay();
  const untilMonday = (8 - day) % 7;

  target.setDate(now.getDate() + untilMonday);
  target.setHours(12, 0, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 7);
  }

  return target;
};

const getWeekStartMonday = (source = new Date()) => {
  const date = new Date(source);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const buildInsights = (entries: Entry[], users: User[]): CampaignInsights => {
  const weekStart = getWeekStartMonday();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const weekEntries = entries.filter((entry) => {
    const d = new Date(entry.date);
    return d >= weekStart && d <= weekEnd;
  });

  const totalsMap = new Map<string, number>();
  const dailyTotals = new Map<string, number>();
  const mentionMap = new Map<string, number>();

  users.forEach((u) => totalsMap.set(u.id, 0));

  weekEntries.forEach((entry) => {
    totalsMap.set(entry.userId, (totalsMap.get(entry.userId) ?? 0) + entry.count);

    const key = dayLabel(new Date(entry.date));
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + entry.count);

    const haystack = `${entry.note ?? ""} ${(entry.tags || []).join(" ")}`.toLowerCase();
    users.forEach((u) => {
      if (!u.name) return;
      const regex = new RegExp(`\\b${u.name.toLowerCase()}\\b`, "g");
      const matches = haystack.match(regex);
      if (matches?.length) {
        mentionMap.set(u.name, (mentionMap.get(u.name) ?? 0) + matches.length);
      }
    });
  });

  const totalsByUser = Array.from(totalsMap.entries())
    .map(([userId, total]) => ({
      userId,
      total,
      name: users.find((u) => u.id === userId)?.name ?? userId,
    }))
    .sort((a, b) => a.total - b.total);

  const bestDay = Array.from(dailyTotals.entries())
    .map(([day, total]) => ({ day, total }))
    .sort((a, b) => b.total - a.total)[0];

  const mentions = Array.from(mentionMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    weekLabel: `Week ${shortDate(weekStart)} - ${shortDate(weekEnd)}`,
    weekRange: `${shortDate(weekStart)} to ${shortDate(weekEnd)}`,
    totalsByUser,
    winner: totalsByUser[0],
    loser: totalsByUser[totalsByUser.length - 1],
    bestDay,
    mentions,
  };
};

export default function CampaignCountdown({
  entries,
  users,
  activeUserId,
}: CampaignCountdownProps) {
  const [countdown, setCountdown] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [isGoodbye, setIsGoodbye] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const targetMonday = useMemo(() => getNextMondayNoon(), []);
  const insights = useMemo(() => buildInsights(entries, users), [entries, users]);

  const cards = [
    {
      title: "🎉 Campaign Wrap Party",
      body: "The campaign is over and wow… that was a wild and fun run!",
    },
    {
      title: "📅 Weekly Story",
      body: `${insights.weekLabel}. Top day: ${insights.bestDay?.day ?? "N/A"} (${insights.bestDay?.total ?? 0}).`,
    },
    {
      title: "🗣️ Most Mentioned Names",
      body:
        insights.mentions.length > 0
          ? insights.mentions.map((m) => `${m.name} ×${m.count}`).join(" • ")
          : "No name shoutouts this week — mysterious vibes.",
    },
    {
      title: "🥁 Drum roll...",
      body: "Hold tight. Ranking reveal is loading with extra sparkle ✨",
    },
    {
      title: "🏆 Results",
      body: `Winner (lowest total): ${insights.winner?.name ?? "N/A"} (${insights.winner?.total ?? 0}). Loser: ${insights.loser?.name ?? "N/A"} (${insights.loser?.total ?? 0}).`,
    },
  ];

  useEffect(() => {
    if (!activeUserId) return;

    const tick = () => {
      const now = new Date();
      const delta = targetMonday.getTime() - now.getTime();

      if (delta <= 0) {
        setCountdown("Campaign ended! Results time 🎊");

        const weekKey = getWeekStartMonday(now).toISOString();
        const lastShown = localStorage.getItem(MONDAY_MODAL_STORAGE);
        if (lastShown !== weekKey) {
          setIsModalOpen(true);
          localStorage.setItem(MONDAY_MODAL_STORAGE, weekKey);
        }
        return;
      }

      const days = Math.floor(delta / (1000 * 60 * 60 * 24));
      const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((delta / (1000 * 60)) % 60);
      const seconds = Math.floor((delta / 1000) % 60);
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMonday, activeUserId]);

  if (!activeUserId) return null;

  const canBack = step > 0;
  const canNext = step < cards.length - 1;

  return (
    <>
      <section className="glass-card rounded-3xl border p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] opacity-70">Campaign to end this Monday</p>
            <h2 className="text-lg font-black">Countdown to Monday 12:00 PM</h2>
          </div>
          <div className="rounded-2xl border border-white/40 bg-white/30 px-4 py-2 text-lg font-black tracking-wide">
            {countdown || "Loading..."}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="theme-backdrop fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card relative w-full max-w-2xl rounded-3xl border p-4 sm:p-6"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStartX === null) return;
                const distance = e.changedTouches[0].clientX - touchStartX;
                if (distance > 50 && canBack) setStep((s) => s - 1);
                if (distance < -50 && canNext) setStep((s) => s + 1);
                setTouchStartX(null);
              }}
            >
              <button
                className="absolute right-3 top-3 rounded-xl border px-3 py-1 text-xs"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>

              <div className="mb-4 flex gap-2">
                {cards.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-2 flex-1 rounded-full ${idx <= step ? "bg-black/80" : "bg-black/20"}`}
                  />
                ))}
              </div>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-5 min-h-[220px] rounded-2xl border border-white/40 bg-white/20 p-4"
              >
                <h3 className="mb-2 text-2xl font-black">{cards[step].title}</h3>
                <p className="text-sm leading-relaxed opacity-85">{cards[step].body}</p>

                {step === 1 && (
                  <div className="mt-4 grid gap-2">
                    {insights.totalsByUser.map((user) => (
                      <div key={user.userId} className="rounded-xl border border-white/40 p-2 text-sm">
                        <div className="mb-1 flex items-center justify-between">
                          <span>{user.name}</span>
                          <strong>{user.total}</strong>
                        </div>
                        <div className="h-2 rounded-full bg-black/15">
                          <div
                            className="h-full rounded-full bg-black/70"
                            style={{
                              width: `${Math.max(
                                8,
                                (user.total /
                                  Math.max(
                                    ...insights.totalsByUser.map((u) => u.total),
                                    1,
                                  )) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <p className="text-xs opacity-70">{insights.weekRange}</p>
                  </div>
                )}

                {step === 4 && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-300/70 bg-emerald-200/30 p-3">
                      <p className="text-xs uppercase">Winner 🏆</p>
                      <p className="text-xl font-black">{insights.winner?.name ?? "N/A"}</p>
                      <p className="text-sm">Lowest total: {insights.winner?.total ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-rose-300/70 bg-rose-200/30 p-3">
                      <p className="text-xs uppercase">Loser 😢</p>
                      <p className="text-xl font-black">{insights.loser?.name ?? "N/A"}</p>
                      <p className="text-sm">Highest total: {insights.loser?.total ?? 0}</p>
                    </div>
                  </div>
                )}
              </motion.div>

              <div className="flex items-center justify-between">
                <button
                  className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40"
                  disabled={!canBack}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  Back
                </button>

                {canNext ? (
                  <button
                    className="rounded-xl border bg-black/80 px-4 py-2 text-sm text-white"
                    onClick={() => setStep((s) => Math.min(cards.length - 1, s + 1))}
                  >
                    Next card
                  </button>
                ) : (
                  <button
                    className="rounded-xl border bg-black/90 px-4 py-2 text-sm text-white"
                    onClick={() => {
                      setIsGoodbye(true);
                      setTimeout(() => {
                        setIsGoodbye(false);
                        setIsModalOpen(false);
                        setStep(0);
                      }, 1300);
                    }}
                  >
                    Complete + close
                  </button>
                )}
              </div>
            </motion.div>

            <AnimatePresence>
              {isGoodbye && (
                <motion.div
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.95 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.p
                    className="text-center text-2xl font-black text-white"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    Goodbye campaign 👋\nIt was fun.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
