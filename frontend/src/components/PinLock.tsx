import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { IconLock } from "./Icons";

interface PinLockProps {
  pinValue: string;
  setPinValue: (value: string) => void;
  authError: string;
  onPinSubmit: () => void;
}

export default function PinLock({
  pinValue,
  setPinValue,
  authError,
  onPinSubmit,
}: PinLockProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle Enter key press
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && pinValue.length === 4) {
      onPinSubmit();
    }
  };

  return (
    <div className="theme-backdrop fixed inset-0 z-50 flex items-center justify-center">
      <div className="glass-card w-[90%] max-w-sm rounded-3xl p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              PIN
            </p>
            <h1 className="mt-2 text-2xl font-semibold">Enter PIN</h1>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-xl text-white">
            <IconLock />
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-white/70">Enter PIN to unlock</p>
        </div>

        <input
          ref={inputRef}
          value={pinValue}
          onChange={(event) =>
            setPinValue(event.target.value.replace(/\D/g, "").slice(0, 4))
          }
          onKeyDown={handleKeyDown}
          type="password"
          inputMode="numeric"
          placeholder="PIN"
          className="soft-input mt-2 w-full text-center text-2xl tracking-[0.5em]"
          autoFocus
        />

        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
          >
            {authError}
          </motion.div>
        )}

        <button
          onClick={onPinSubmit}
          disabled={pinValue.length !== 4}
          className="theme-btn-primary mt-8 w-full rounded-2xl py-4 text-sm font-semibold shadow-floaty transition-all disabled:cursor-not-allowed disabled:opacity-40"
        >
          Unlock
        </button>

        <p className="mt-4 text-center text-xs text-white/40">
          Press <kbd className="theme-panel rounded px-2 py-1">Enter</kbd> to
          submit
        </p>
      </div>
    </div>
  );
}
