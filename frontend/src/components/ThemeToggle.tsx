import { motion, Transition } from "framer-motion";
import clsx from "clsx";

type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
  floating?: boolean;
};

const springTransition: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 24,
};

export default function ThemeToggle({
  isDark,
  onToggle,
  floating = true,
}: ThemeToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={clsx(
        "group z-[10000] cursor-pointer",
        floating
          ? "fixed bottom-[88px] right-3 sm:bottom-auto sm:right-6 sm:top-6"
          : "relative",
      )}
      initial={false}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03, y: -1 }}
      transition={springTransition}
    >
      <div
        className={clsx(
          "relative flex h-9 w-20 items-center rounded-full border-2 px-1 shadow-[0_8px_25px_rgba(0,0,0,0.35)] transition-colors duration-500 sm:h-11 sm:w-24",
          isDark
            ? "border-white/20 bg-[#0b0e14]"
            : "border-black/80 bg-[#f8f3e8]",
        )}
      >
        {isDark && (
          <>
            <span className="absolute left-4 top-2 h-1 w-1 animate-pulse rounded-full bg-white/90" />
            <span className="absolute left-10 top-6 h-1 w-1 rounded-full bg-white/70 [animation:ping_2.5s_linear_infinite]" />
            <span className="absolute left-14 top-3 h-1.5 w-1.5 rounded-full bg-white/80 [animation:pulse_1.8s_ease-in-out_infinite]" />
          </>
        )}

        <motion.span
          className={clsx(
            "relative grid h-7 w-7 place-items-center rounded-full border text-xs transition-transform duration-500 sm:h-8 sm:w-8 sm:text-sm",
            isDark ? "translate-x-[44px] rotate-[360deg] sm:translate-x-[56px]" : "translate-x-0 rotate-0",
            isDark
              ? "border-slate-300/40 bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900"
              : "border-black/80 bg-[#f6e05e] text-black shadow-[0_0_18px_rgba(0,0,0,0.2)]",
          )}
        >
          {isDark ? "🌙" : "☀️"}
        </motion.span>
      </div>
      <span
        className={clsx(
          "pointer-events-none mt-2 hidden text-center text-[10px] font-semibold uppercase tracking-[0.25em] sm:block",
          isDark ? "text-white/70" : "text-black/80",
        )}
      >
        {isDark ? "Dark" : "Light"}
      </span>
    </motion.button>
  );
}
