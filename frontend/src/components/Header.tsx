import { User } from "../types";
import { IconHeart, IconUser, IconCalendar } from "./Icons";

interface HeaderProps {
  activeUser: User | null;
  weekNumber: number;
  weekLabel: string;
  onLogout: () => void;
}

export default function Header({
  activeUser,
  weekNumber,
  weekLabel,
  onLogout,
}: HeaderProps) {
  return (
    <header
      id="dashboard"
      className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="ፉክክር ቤት logo"
            className="h-9 w-9 rounded-xl object-contain sm:h-11 sm:w-11"
          />

          <div>
            <h1 className="mt-1 text-3xl font-semibold text-mist sm:mt-2">
              የፉክክር ቤት
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/10 px-3 py-1">
                {activeUser ? `የ ${activeUser.loveName} ቤት` : "PIN locked"}
              </span>

              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 transition-colors hover:bg-white/10"
              >
                Switch PIN
              </button>
            </div>
          </div>
        </div>
        <div className="glass-card flex min-w-[300px] flex-col gap-3 rounded-3xl px-4 py-3 text-xs text-white/70">
          <div className="flex items-center gap-2 text-white/80">
            <IconUser />
            <span>{activeUser?.loveName ?? "User"}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <IconCalendar />
            <span>Week {weekNumber}</span>
          </div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">
            {weekLabel}
          </div>
        </div>
      </div>
    </header>
  );
}
