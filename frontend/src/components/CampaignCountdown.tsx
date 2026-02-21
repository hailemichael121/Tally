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
const DEV_MODE = import.meta.env.VITE_CAMPAIGN_DEV_MODE === "true";
const DEV_FORCE_ENDED = import.meta.env.VITE_CAMPAIGN_DEV_FORCE_ENDED === "true";

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
  return {
    days: Math.floor(totalMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((totalMs / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((totalMs / (1000 * 60)) % 60),
    seconds: Math.floor((totalMs / 1000) % 60),
    totalMs,
  };
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);

const buildMockUsers = (): User[] => [
  { id: "tekta", name: "Tekta", loveName: "Shefafit", track: "males" },
  { id: "yihun", name: "Yihun", loveName: "Shebeto", track: "females" },
];

const buildMockEntries = () => {
  const now = new Date();
  const monday = getNextMondayNoon(now);
  monday.setDate(monday.getDate() - 7);
  monday.setHours(9, 0, 0, 0);

  const mock: Entry[] = [];
  const notes = [
    "tekta got teased by yihun 😄",
    "shefafit and shebeto are playful",
    "yihun yihun yihun!",
    "tekta in focus today",
    "shebeto wins hearts",
    "shefafit mentioned twice shefafit",
    "final sunday banter",
  ];

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    mock.push({
      id: `mock-t-${i}`,
      userId: "tekta",
      count: 1 + (i % 3),
      note: notes[i],
      tags: ["fun", i % 2 === 0 ? "tekta" : "yihun"],
      date: day.toISOString(),
      weekStart: monday.toISOString(),
      imageUrl: null,
      editedAt: null,
      user: buildMockUsers()[0],
    });
    mock.push({
      id: `mock-y-${i}`,
      userId: "yihun",
      count: 2 + (i % 4),
      note: `${notes[(i + 2) % notes.length]} shebeto`,
      tags: ["chaos", i % 2 === 0 ? "shefafit" : "shebeto"],
      date: day.toISOString(),
      weekStart: monday.toISOString(),
      imageUrl: null,
      editedAt: null,
      user: buildMockUsers()[1],
    });
  }

  return mock;
};

export default function CampaignCountdown({ users, entries, activeUserId }: CampaignCountdownProps) {
  const [deadline, setDeadline] = useState(() => getNextMondayNoon(new Date()));
  const [countdown, setCountdown] = useState(() => getCountdown(deadline));
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isGoodbye, setIsGoodbye] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const sourceUsers = useMemo(() => (DEV_MODE ? buildMockUsers() : users), [users]);
  const sourceEntries = useMemo(() => (DEV_MODE ? buildMockEntries() : entries), [entries]);

  useEffect(() => {
    if (DEV_FORCE_ENDED) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
      return;
    }

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
    () => sourceUsers.filter((user) => user.id !== "judge" && user.id !== "yeabsra"),
    [sourceUsers],
  );

  const campaignStats = useMemo(() => {
    const filteredEntries = sourceEntries.filter((entry) => {
      const time = new Date(entry.date).getTime();
      return (
        time >= previousWeek.start.getTime() &&
        time <= previousWeek.end.getTime() &&
        players.some((player) => player.id === entry.userId)
      );
    });

    const totalsByUser: Record<string, number> = {};
    const mentionsByName: Record<string, number> = {};
    const mentionsByPlayer: Record<string, number> = {};
    const byDay: Record<string, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    players.forEach((player) => {
      totalsByUser[player.id] = 0;
      mentionsByName[player.name] = 0;
      mentionsByName[player.loveName] = 0;
      mentionsByPlayer[player.id] = 0;
    });

    filteredEntries.forEach((entry) => {
      totalsByUser[entry.userId] = (totalsByUser[entry.userId] ?? 0) + entry.count;
      const day = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(entry.date));
      byDay[day] = (byDay[day] ?? 0) + entry.count;

      const text = `${entry.note ?? ""} ${(entry.tags || []).join(" ")}`.toLowerCase();
      players.forEach((player) => {
        [player.name, player.loveName].forEach((raw) => {
          const candidate = raw.toLowerCase();
          const matches = text.match(new RegExp(`\\b${candidate}\\b`, "g"));
          if (!matches?.length) return;
          mentionsByName[raw] += matches.length;
          mentionsByPlayer[player.id] += matches.length;
        });
      });
    });

    const sortedPlayers = [...players].sort(
      (a, b) => (totalsByUser[a.id] ?? 0) - (totalsByUser[b.id] ?? 0),
    );

    return {
      totalsByUser,
      byDay,
      winner: sortedPlayers[0],
      loser: sortedPlayers[sortedPlayers.length - 1],
      topMention: Object.entries(mentionsByName).sort((a, b) => b[1] - a[1])[0] ?? ["Nobody", 0],
      bestDay: Object.entries(byDay).sort((a, b) => b[1] - a[1])[0] ?? ["Monday", 0],
      mentionsByPlayer,
      hasEntries: filteredEntries.length > 0,
    };
  }, [players, previousWeek.end, previousWeek.start, sourceEntries]);

  useEffect(() => {
    const weekKey = deadline.toISOString().slice(0, 10);
    const dismissed = localStorage.getItem(MODAL_DISMISSED_KEY);
    if ((countdown.totalMs === 0 || DEV_FORCE_ENDED) && activeUserId && (DEV_MODE || dismissed !== weekKey)) {
      setModalOpen(true);
      setActiveStep(0);
    }
  }, [activeUserId, countdown.totalMs, deadline]);

  useEffect(() => {
    if (!DEV_MODE) return;
    setModalOpen(true);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: scrollRef.current.clientWidth * activeStep, behavior: "smooth" });
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
            <div key={player.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
              <span>{player.loveName}</span>
              <span className="font-semibold">{campaignStats.totalsByUser[player.id] ?? 0}</span>
            </div>
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
      ),
    },
    {
      title: "Name-drop detector 👀",
      content: (
        <div className="space-y-3 text-sm text-white/80">
          <p>
            Top mention: <span className="font-semibold">{campaignStats.topMention[0]}</span> ({campaignStats.topMention[1]} times)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {players.map((player) => (
              <div key={player.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-xs text-white/60">{player.loveName}</p>
                <p className="mt-1 text-xl font-semibold">{campaignStats.mentionsByPlayer[player.id] ?? 0}</p>
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
            <p className="text-emerald-100/90">
              Total: {campaignStats.winner ? campaignStats.totalsByUser[campaignStats.winner.id] : 0}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-300/40 bg-rose-500/20 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-rose-100">Loser 😢</p>
            <p className="mt-1 text-lg font-semibold text-rose-100">{campaignStats.loser?.loveName ?? "TBD"}</p>
            <p className="text-rose-100/90">
              Total: {campaignStats.loser ? campaignStats.totalsByUser[campaignStats.loser.id] : 0}
            </p>
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
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white/90">my bb, so bb it ends in ...</p>
          {DEV_MODE && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-xl border border-white/30 px-3 py-1 text-xs text-white"
            >
              Open mock modal
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-white/70">Campaign ends Monday 12:00 PM.</p>
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
              <div className="mb-3 flex items-center justify-between gap-3">
                {cards.map((card, index) => (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className="flex flex-1 items-center gap-2"
                    aria-label={`Go to ${card.title}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${activeStep >= index ? "bg-pink-300" : "bg-white/35"}`}
                    />
                    <span className={`h-[2px] flex-1 ${activeStep > index ? "bg-pink-300" : "bg-white/20"}`} />
                  </button>
                ))}
              </div>

              <div ref={scrollRef} className="flex overflow-hidden">
                {cards.map((card) => (
                  <div key={card.title} className="w-full flex-none rounded-2xl bg-white/5 p-4">
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
