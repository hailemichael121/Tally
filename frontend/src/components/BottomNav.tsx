import clsx from "clsx";
import { ActiveTab } from "../types";
import { ListPlus, LayoutDashboard, History } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext"; // You'll need to create this

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onNewEntry: () => void;
  canCreateEntry: boolean;
  hasUnreadNotifications?: boolean;
}

export default function BottomNav({
  activeTab,
  onTabChange,
  onNewEntry,
  canCreateEntry,
  hasUnreadNotifications = false,
}: BottomNavProps) {
  const { theme } = useTheme(); // Get current theme
  const isDark = theme === "dark";

  const handleTab = (tab: Exclude<ActiveTab, "new">) => {
    onTabChange(tab);
    const target = document.getElementById(tab);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Theme-aware path classes
  const pathClasses = isDark
    ? "fill-black stroke-black/10 backdrop-blur-xl"
    : "fill-white/80 stroke-black/10 backdrop-blur-xl";

  // Theme-aware text colors
  const getTabClasses = (tabName: ActiveTab) =>
    clsx(
      "flex flex-col items-center gap-0.5 transition-all",
      activeTab === tabName
        ? isDark
          ? "scale-110 text-white"
          : "scale-110 text-black"
        : isDark
          ? "text-white/50 hover:text-white/80"
          : "text-black/50 hover:text-black/80",
    );

  return (
    <nav className="fixed bottom-6 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-6">
      <div className="relative h-[64px] w-full">
        <svg
          viewBox="0 0 400 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full drop-shadow-lg"
          preserveAspectRatio="none"
        >
          {/* MOBILE PATH (Shown on small screens) */}
          <path
            d="M0 32 
                 Q0 0 32 0 
                 L120 0 
                 C165 0 175 38 200 25
                 C225 38 235 0 270 0
                 L368 0 
                 Q400 0 400 32 
                 Q400 64 368 64 
                 L32 64 
                 Q0 64 0 32Z"
            className={clsx(pathClasses, "sm:hidden")}
            strokeWidth="1.5"
          />

          {/* DESKTOP PATH (Shown on sm screens and up) */}
          <path
            d="M0 32 
                 Q0 0 32 0 
                 L140 0 
                 C165 0 175 29 200 25
                 C225 30 225 0 260 0
                 L368 0 
                 Q400 0 400 32 
                 Q400 64 368 64 
                 L32 64 
                 Q0 64 0 32Z"
            className={clsx(pathClasses, "hidden sm:block")}
            strokeWidth="1.5"
          />
        </svg>

        {/* Icon content */}
        <div className="relative z-10 flex h-full items-center justify-between px-10">
          {/* Dashboard */}
          <button
            onClick={() => handleTab("dashboard")}
            className={getTabClasses("dashboard")}
          >
            <LayoutDashboard size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              Dash
            </span>
          </button>

          {/* Center floating + button */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <button
              onClick={onNewEntry}
              disabled={!canCreateEntry}
              className={clsx(
                "flex h-14 w-14 items-center justify-center rounded-full border shadow-xl",
                "transition-all active:scale-90",
                isDark
                  ? "border-white/20 bg-white text-black"
                  : "border-black/10 bg-white text-black",
                !canCreateEntry && "opacity-40 cursor-not-allowed",
              )}
            >
              <ListPlus size={28} />
            </button>
          </div>

          {/* History */}
          <button
            onClick={() => handleTab("history")}
            className={clsx(getTabClasses("history"), "relative")}
          >
            {hasUnreadNotifications && (
              <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-rose-300/90" />
            )}
            <History size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              History
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
