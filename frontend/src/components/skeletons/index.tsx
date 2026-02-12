// components/skeletons/index.tsx
import { motion } from "framer-motion";
import clsx from "clsx";

export function HeaderSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/10 animate-pulse sm:h-11 sm:w-11" />
          <div className="space-y-3">
            <motion.div
              className="h-6 w-40 rounded-xl bg-white/10"
              animate={{
                background: [
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="flex gap-2">
              <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>
        <motion.div
          className="flex min-w-[200px] flex-col gap-3 rounded-3xl bg-white/5 px-4 py-3 border border-white/10"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-4 w-24 rounded-full bg-white/10" />
          <div className="h-4 w-16 rounded-full bg-white/10" />
          <div className="h-3 w-32 rounded-full bg-white/10" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function WeeklyTotalsSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <motion.div
          className="h-6 w-32 rounded-full bg-white/10"
          animate={{
            background: [
              "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
              "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="h-4 w-20 rounded-full bg-white/10 animate-pulse" />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-3xl border border-white/10 bg-white/5 p-4"
            animate={{
              borderColor: [
                "rgba(255,255,255,0.1)",
                "rgba(255,255,255,0.2)",
                "rgba(255,255,255,0.1)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded-full bg-white/10 animate-pulse" />
                <div className="h-5 w-24 rounded-full bg-white/10 animate-pulse" />
              </div>
              <div className="h-6 w-6 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div className="h-8 w-12 rounded-full bg-white/10 animate-pulse" />
              <div className="h-3 w-8 rounded-full bg-white/10 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function WeeklyStatusSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-6 shadow-soft">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <motion.div
            className="h-3 w-24 rounded-full bg-white/10"
            animate={{
              background: [
                "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)",
                "linear-gradient(90deg, rgba(255,255,255,0.1) 100%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 0%)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="h-6 w-32 rounded-full bg-white/10 animate-pulse" />
          <div className="h-3 w-40 rounded-full bg-white/10 animate-pulse" />
        </div>
        <div className="h-6 w-6 rounded-full bg-white/10 animate-spin" />
      </div>
      <motion.div
        className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4"
        animate={{
          borderColor: [
            "rgba(255,255,255,0.1)",
            "rgba(255,255,255,0.3)",
            "rgba(255,255,255,0.1)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded-full bg-white/10 animate-pulse" />
            <div className="h-5 w-36 rounded-full bg-white/10 animate-pulse" />
          </div>
          <div className="h-8 w-8 rounded-2xl bg-white/10 animate-pulse" />
        </div>
        <div className="mt-2 h-3 w-48 rounded-full bg-white/10 animate-pulse" />
      </motion.div>
      <motion.div
        className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4"
        animate={{
          borderColor: [
            "rgba(255,255,255,0.1)",
            "rgba(255,255,255,0.2)",
            "rgba(255,255,255,0.1)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      >
        <div className="h-3 w-32 rounded-full bg-white/10 animate-pulse" />
        <div className="mt-3 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-20 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-12 rounded-full bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function DailyBreakdownSkeleton() {
  return (
    <div className="glass-card rounded-3xl p-4 md:p-5 border border-white/10">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="h-10 w-10 rounded-lg bg-white/10 animate-pulse" />
        <div className="flex-1 flex flex-col items-center">
          <div className="h-4 w-24 rounded-full bg-white/10 animate-pulse mb-3" />
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex flex-col items-center w-11 h-14">
                <div className="h-3 w-6 rounded-full bg-white/10 animate-pulse mb-1" />
                <div className="h-5 w-5 rounded-full bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="md:hidden flex gap-2 py-1 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-12 h-11 rounded-xl bg-white/10 animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-white/10 animate-pulse" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded-full bg-white/10 animate-pulse" />
          <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
        </div>
        <div className="h-8 w-24 rounded-xl bg-white/10 animate-pulse" />
      </div>
      <div className="space-y-2 max-h-56 md:max-h-64 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="w-full flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-white/5 border border-white/10"
            animate={{
              background: [
                "rgba(255,255,255,0.05)",
                "rgba(255,255,255,0.08)",
                "rgba(255,255,255,0.05)",
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-16 rounded-full bg-white/10 animate-pulse" />
                <div className="h-2 w-10 rounded-full bg-white/10 animate-pulse" />
              </div>
              <div className="h-3 w-32 rounded-full bg-white/10 animate-pulse" />
              <div className="flex gap-1">
                <div className="h-2 w-12 rounded-full bg-white/10 animate-pulse" />
                <div className="h-2 w-8 rounded-full bg-white/10 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-12 rounded-lg bg-white/10 animate-pulse" />
              <div className="h-4 w-4 rounded-full bg-white/10 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function BottomNavSkeleton() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="
        fixed bottom-6 left-0 right-0 z-40 
        mx-auto w-full max-w-md px-4 sm:px-6
      "
    >
      <div className="relative h-[64px] w-full">
        {/* SVG Path – already somewhat adaptive, but improved */}
        <svg
          viewBox="0 0 400 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full drop-shadow-lg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 32 Q0 0 32 0 L120 0 C165 0 175 38 200 25 C225 38 235 0 270 0 L368 0 Q400 0 400 32 Q400 64 368 64 L32 64 Q0 64 0 32Z"
            className="
              fill-white/70 dark:fill-white/20 
              stroke-black/10 dark:stroke-white/10 
              backdrop-blur-xl sm:hidden
            "
            strokeWidth="1.5"
          />

          <path
            d="M0 32 Q0 0 32 0 L140 0 C165 0 175 29 200 25 C225 30 225 0 260 0 L368 0 Q400 0 400 32 Q400 64 368 64 L32 64 Q0 64 0 32Z"
            className="
              fill-white/70 dark:fill-white/20 
              stroke-black/10 dark:stroke-white/10 
              backdrop-blur-xl hidden sm:block
            "
            strokeWidth="1.5"
          />
        </svg>

        {/* Icon content skeleton – now theme responsive */}
        <div className="relative z-10 flex h-full items-center justify-between px-8 sm:px-10">
          {/* Dashboard / History icons skeleton */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="h-5 w-5 rounded-full bg-white/20 dark:bg-white/10 animate-pulse" />
            <div className="h-2 w-8 rounded-full bg-white/20 dark:bg-white/10 animate-pulse" />
          </div>

          {/* Center floating FAB button */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <div
              className="
                flex h-14 w-14 items-center justify-center 
                rounded-full border border-white/20 dark:border-white/10 
                bg-white/90 dark:bg-gray-900/80 
                shadow-xl animate-pulse backdrop-blur-sm
              "
            >
              <div className="h-7 w-7 rounded-full bg-black/10 dark:bg-white/10" />
            </div>
          </div>

          {/* History skeleton (symmetric) */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="h-5 w-5 rounded-full bg-white/20 dark:bg-white/10 animate-pulse" />
            <div className="h-2 w-8 rounded-full bg-white/20 dark:bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-8">
        <HeaderSkeleton />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <WeeklyTotalsSkeleton />
          <WeeklyStatusSkeleton />
        </div>
        <div className="mt-6">
          <DailyBreakdownSkeleton />
        </div>
      </div>
      {/* Use the simplified version to ensure centering */}
      <BottomNavSkeleton />
    </div>
  );
}
