import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Entry, User } from "../types";

type CampaignCountdownProps = {
  users: User[];
  entries: Entry[];
  activeUserId: string;
};

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

const MODAL_DISMISSED_KEY = "tally-campaign-modal-dismissed";

const getNextMondayNoon = (base: Date) => {
  const date = new Date(base);
  date.setSeconds(0, 0);
  const day = date.getDay();
  const daysUntilMonday = (8 - day) % 7;
  const nextMonday = new Date(date);
  nextMonday.setDate(date.getDate() + daysUntilMonday);
  nextMonday.setHours(12, 0, 0, 0);

  if (daysUntilMonday === 0 && date.getTime() >= nextMonday.getTime()) {
    nextMonday.setDate(nextMonday.getDate() + 7);
  }

  return nextMonday;
};

const getCountdown = (target: Date): CountdownParts => {
  const diff = target.getTime() - Date.now();
  const totalMs = Math.max(0, diff);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);
  return { days, hours, minutes, seconds, totalMs };
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);

export default function CampaignCountdown({
  users,
  entries,
  activeUserId,
}: CampaignCountdownProps) {
  const [deadline, setDeadline] = useState(() => getNextMondayNoon(new Date()));
  const [countdown, setCountdown] = useState(() => getCountdown(deadline));
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isGoodbye, setIsGoodbye] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = getCountdown(deadline);
      setCountdown(next);

      if (next.totalMs === 0) {
        const newDeadline = getNextMondayNoon(new Date(Date.now() + 3600000));
        setDeadline(newDeadline);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deadline]);

  const previousWeek = useMemo(() => {
    const end = new Date(deadline);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }, [deadline]);

  const players = useMemo(
    () => users.filter((user) => user.id !== "judge" && user.id !== "yeabsra"),
    [users],
  );

  const campaignStats = useMemo(() => {
    const filteredEntries = entries.filter((entry) => {
      const time = new Date(entry.date).getTime();
      return (
        time >= previousWeek.start.getTime() &&
        time <= previousWeek.end.getTime() &&
        players.some((player) => player.id === entry.userId)
      );
    });

    const totalsByUser: Record<string, number> = {};
    const byDay: Record<string, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };
    const mentionsByName: Record<string, number> = {};
    const mentionsByPlayer: Record<string, number> = {};

    players.forEach((player) => {
      totalsByUser[player.id] = 0;
      mentionsByName[player.name] = 0;
      mentionsByName[player.loveName] = 0;
      mentionsByPlayer[player.id] = 0;
    });

    for (const entry of filteredEntries) {
      totalsByUser[entry.userId] = (totalsByUser[entry.userId] ?? 0) + entry.count;
      const day = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
        new Date(entry.date),
      );
      byDay[day] = (byDay[day] ?? 0) + entry.count;

      const text = `${entry.note ?? ""} ${(entry.tags || []).join(" ")}`.toLowerCase();
      for (const player of players) {
        const names = [player.name, player.loveName].map((name) => name.toLowerCase());
        for (const candidate of names) {
          if (!candidate) continue;
          const matches = text.match(new RegExp(`\\b${candidate}\\b`, "g"));
          if (matches?.length) {
            mentionsByName[candidate === player.name.toLowerCase() ? player.name : player.loveName] +=
              matches.length;
            mentionsByPlayer[player.id] += matches.length;
          }
        }
      }
    }

    const sortedPlayers = [...players].sort(
      (a, b) => (totalsByUser[a.id] ?? 0) - (totalsByUser[b.id] ?? 0),
    );

    const winner = sortedPlayers[0];
    const loser = sortedPlayers[sortedPlayers.length - 1];

    const bestDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0] ?? ["Monday", 0];
    const topMention = Object.entries(mentionsByName).sort((a, b) => b[1] - a[1])[0] ?? ["Nobody", 0];

    return {
      totalsByUser,
      byDay,
      winner,
      loser,
      bestDay,
      topMention,
      mentionsByPlayer,
      hasEntries: filteredEntries.length > 0,
    };
  }, [entries, players, previousWeek.end, previousWeek.start]);

  useEffect(() => {
    const weekKey = deadline.toISOString().slice(0, 10);
    const dismissed = localStorage.getItem(MODAL_DISMISSED_KEY);
    if (countdown.totalMs === 0 && activeUserId && dismissed !== weekKey) {
      setModalOpen(true);
      setActiveStep(0);
    }
  }, [countdown.totalMs, deadline, activeUserId]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({ left: activeStep * width, behavior: "smooth" });
  }, [activeStep]);

  const closeModal = () => {
    const weekKey = deadline.toISOString().slice(0, 10);
    localStorage.setItem(MODAL_DISMISSED_KEY, weekKey);
    setIsGoodbye(false);
    setModalOpen(false);
  };

  const cards = [
    {
      title: "Campaign closed 🎉",
      content: (
        <div className="space-y-2 text-sm text-white/80">
          <p>What a playful week! Here is your recap from:</p>
          <p className="rounded-xl bg-white/10 p-3 font-semibold">
            {formatDate(previousWeek.start)} → {formatDate(previousWeek.end)}
          </p>
          {players.map((player) => (
            <p key={player.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
              <span>{player.loveName}</span>
              <span className="font-semibold">{campaignStats.totalsByUser[player.id] ?? 0}</span>
            </p>
          ))}
        </div>
      ),
    },
    {
      title: "Spiciest day of the week 🌶️",
      content: (
        <div className="space-y-3 text-sm text-white/80">
          <p>
            Highest day: <span className="font-semibold">{campaignStats.bestDay[0]}</span> with{" "}
            <span className="font-semibold">{campaignStats.bestDay[1]}</span> total.
          </p>
          <div className="space-y-2">
            {Object.entries(campaignStats.byDay).map(([day, value]) => {
              const max = Math.max(...Object.values(campaignStats.byDay), 1);
              return (
                <div key={day} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{day.slice(0, 3)}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-violet-400"
                      style={{ width: `${(value / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      title: "Name-drop detector 👀",
      content: (
        <div className="space-y-3 text-sm text-white/80">
          <p>
            Top mention: <span className="font-semibold">{campaignStats.topMention[0]}</span> ({" "}
            {campaignStats.topMention[1]} times)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {players.map((player) => (
              <div key={player.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-xs text-white/60">{player.loveName}</p>
                <p className="mt-1 text-xl font-semibold">
                  {campaignStats.mentionsByPlayer[player.id] ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "🥁 Drum roll...",
      content: (
        <div className="space-y-4 text-center text-white/80">
          <p className="text-sm">Lowest total wins this challenge.</p>
          <p className="text-5xl">🥁🥁🥁</p>
        </div>
      ),
    },
    {
      title: "Final verdict",
      content: (
        <div className="space-y-3 text-sm">
          <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/20 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-100">Winner 🏆</p>
            <p className="mt-1 text-lg font-semibold text-emerald-100">{campaignStats.winner?.loveName ?? "TBD"}</p>
            <p className="text-emerald-100/90">Total: {campaignStats.winner ? campaignStats.totalsByUser[campaignStats.winner.id] : 0}</p>
          </div>
          <div className="rounded-2xl border border-rose-300/40 bg-rose-500/20 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-100">Loser 😢</p>
            <p className="mt-1 text-lg font-semibold text-rose-100">{campaignStats.loser?.loveName ?? "TBD"}</p>
            <p className="text-rose-100/90">Total: {campaignStats.loser ? campaignStats.totalsByUser[campaignStats.loser.id] : 0}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsGoodbye(true)}
            className="w-full rounded-2xl bg-white/20 px-4 py-2 font-semibold text-white"
          >
            Complete ceremony ✨
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="glass-card rounded-3xl border border-white/20 bg-gradient-to-r from-fuchsia-500/20 via-violet-500/15 to-cyan-500/20 p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">Campaign ending countdown</p>
        <p className="mt-1 text-sm text-white/80">This round ends Monday at 12:00 PM.</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            [countdown.days, "Days"],
            [countdown.hours, "Hours"],
            [countdown.minutes, "Min"],
            [countdown.seconds, "Sec"],
          ].map(([value, label]) => (
            <div key={label as string} className="rounded-2xl bg-black/20 p-2">
              <p className="text-lg font-semibold">{String(value).padStart(2, "0")}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && campaignStats.hasEntries && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card w-full max-w-2xl rounded-3xl border border-white/20 p-4 sm:p-6"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              <div className="mb-3 flex items-center justify-center gap-2">
                {cards.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      activeStep === index ? "w-6 bg-white" : "w-2 bg-white/40"
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              <div ref={scrollRef} className="flex snap-x snap-mandatory overflow-hidden">
                {cards.map((card) => (
                  <div key={card.title} className="w-full flex-none snap-center rounded-2xl bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <div className="mt-3">{card.content}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  className="rounded-xl border border-white/20 px-3 py-2 text-sm text-white disabled:opacity-40"
                >
                  Back
                </button>
                {activeStep < cards.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => Math.min(cards.length - 1, prev + 1))}
                    className="rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Close
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
                  <motion.button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl border border-white/30 px-6 py-3 text-white"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    Goodbye, champions 👋 (tap to close)
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
