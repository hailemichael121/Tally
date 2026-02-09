import clsx from "clsx";
import { ActiveTab } from "../types";

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const handleTab = (tab: ActiveTab) => {
    onTabChange(tab);
    const targetId =
      tab === "dashboard" ? "dashboard" : tab === "new" ? "new" : "history";
    const target = document.getElementById(targetId);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[92%] max-w-sm -translate-x-1/2 rounded-3xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between text-xs text-white/70">
        <button
          type="button"
          onClick={() => handleTab("dashboard")}
          className={clsx(
            "transition-colors",
            activeTab === "dashboard" && "text-blush",
          )}
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => handleTab("new")}
          className={clsx(
            "transition-colors",
            activeTab === "new" && "text-blush",
          )}
        >
          New
        </button>
        <button
          type="button"
          onClick={() => handleTab("history")}
          className={clsx(
            "transition-colors",
            activeTab === "history" && "text-blush",
          )}
        >
          History
        </button>
      </div>
    </nav>
  );
}
