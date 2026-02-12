import { Entry } from "../types";
import { useState, useMemo, useEffect, useRef } from "react";
import { Users, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DailyBreakdownProps {
  entries: Entry[];
  selectedWeekStart: string;
  onWeekChange: (weekStart: string) => void;
  onEntryClick: (entry: Entry) => void;
  onDateSelect: (date: string) => void;
  activeUserId: string; // Add activeUserId prop
}

// Timezone-aware date formatters
const formatDayName = (date: Date) => {
  const utcDate = new Date(date.toISOString().split("T")[0] + "T00:00:00Z");
  return utcDate
    .toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
    .substring(0, 2);
};

const formatDayNum = (date: Date) => {
  const utcDate = new Date(date.toISOString().split("T")[0] + "T00:00:00Z");
  return utcDate.getUTCDate();
};

const formatMonthYear = (date: Date) => {
  const utcDate = new Date(date.toISOString().split("T")[0] + "T00:00:00Z");
  return utcDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const formatFullDate = (date: Date) => {
  const utcDate = new Date(date.toISOString().split("T")[0] + "T00:00:00Z");
  return utcDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

// Get date key in YYYY-MM-DD format, timezone-aware
const formatDateKey = (dateString: string) => {
  const date = new Date(dateString);
  // Convert to UTC midnight to avoid timezone issues
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  return utcDate.toISOString().split("T")[0];
};

// Get local date string in YYYY-MM-DD format
const getLocalDateKey = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const weekStartFromDate = (value: string) => {
  const date = new Date(value);
  const utcDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = utcDate.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(utcDate);
  monday.setUTCDate(utcDate.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
};

const getDaysInWeek = (weekStart: string) => {
  const start = new Date(weekStart);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    day.setUTCHours(0, 0, 0, 0);
    days.push(day);
  }

  return days;
};

// Get display date for a Date object
const getDisplayDate = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date;
  } catch (error) {
    console.error("Error creating date from string:", dateStr, error);
    return new Date();
  }
};

// Loading Skeleton Component
const DateSkeleton = () => (
  <div className="flex flex-col items-center justify-center w-11 h-14 rounded-xl bg-white/5 animate-pulse">
    <div className="w-6 h-2.5 rounded-full bg-white/10 mb-1.5"></div>
    <div className="w-5 h-5 rounded-full bg-white/10"></div>
  </div>
);

const EntrySkeleton = () => (
  <div className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 animate-pulse">
    <div className="flex flex-col items-start flex-1">
      <div className="flex items-center gap-2">
        <div className="w-16 h-3.5 rounded-full bg-white/10"></div>
        <div className="w-10 h-2.5 rounded-full bg-white/5"></div>
      </div>
      <div className="w-32 h-2.5 rounded-full bg-white/10 mt-2"></div>
      <div className="flex gap-1 mt-1.5">
        <div className="w-10 h-2.5 rounded-full bg-white/5"></div>
        <div className="w-8 h-2.5 rounded-full bg-white/5"></div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-10 h-8 rounded-lg bg-white/10"></div>
      <div className="w-4 h-4 rounded-full bg-white/10"></div>
    </div>
  </div>
);

// Modern toggle switch component
const FilterToggle = ({
  showAll,
  onToggle,
}: {
  showAll: boolean;
  onToggle: (showAll: boolean) => void;
}) => {
  return (
    <div
      className="
        inline-flex items-center rounded-2xl p-1 shadow-sm
        /* Light Mode: Darker gray background with a clear border */
        border border-gray-300 bg-gray-200/50 
        /* Dark Mode: Stays glassmorphic */
        dark:border-white/10 dark:bg-white/5 dark:shadow-lg dark:backdrop-blur-sm
      "
    >
      {/* Mine Button */}
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={`
          rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200
          ${
            !showAll
              ? `
                /* Light Mode Active: White with a clear outline */
                bg-white text-black border border-gray-300 shadow-sm
                /* Dark Mode Active */
                dark:border-transparent dark:bg-gradient-to-r dark:from-white dark:to-white/90 dark:text-black
              `
              : `
                /* Inactive State */
                text-gray-500 hover:text-gray-800 border border-transparent
                dark:text-white/60 dark:hover:text-white/90
              `
          }
        `}
      >
        Mine
      </button>

      {/* All Button */}
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={`
          rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200
          ${
            showAll
              ? `
                /* Light Mode Active: White with a clear outline */
                bg-white text-black border border-gray-300 shadow-sm
                /* Dark Mode Active */
                dark:border-transparent dark:bg-gradient-to-r dark:from-white dark:to-white/90 dark:text-black
              `
              : `
                /* Inactive State */
                text-gray-500 hover:text-gray-800 border border-transparent
                dark:text-white/60 dark:hover:text-white/90
              `
          }
        `}
      >
        All
      </button>
    </div>
  );
};

export default function DailyBreakdown({
  entries,
  selectedWeekStart,
  onWeekChange,
  onEntryClick,
  onDateSelect,
  activeUserId,
}: DailyBreakdownProps) {
  const [activeDate, setActiveDate] = useState<string>(getLocalDateKey());
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingDate, setIsChangingDate] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dateRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  useEffect(() => {
    const activeEl = dateRefs.current[activeDate];
    const container = scrollRef.current;

    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();

      const offset =
        elRect.left -
        containerRect.left -
        containerRect.width / 2 +
        elRect.width / 2;

      container.scrollBy({
        left: offset,
        behavior: "smooth",
      });
    }
  }, [activeDate]);
  const currentWeekStart =
    selectedWeekStart || weekStartFromDate(new Date().toISOString());
  const weekDays = useMemo(
    () => getDaysInWeek(currentWeekStart),
    [currentWeekStart],
  );

  // Filter entries based on showAllEntries toggle
  const filteredEntries = useMemo(() => {
    if (showAllEntries) {
      return entries; // Show all entries
    }
    // Show only entries belonging to the active user
    return entries.filter((entry) => entry.userId === activeUserId);
  }, [entries, showAllEntries, activeUserId]);

  // Group filtered entries by date with timezone handling
  const groupedEntries = useMemo(() => {
    const grouped = filteredEntries.reduce<Record<string, Entry[]>>(
      (acc, entry) => {
        try {
          const dateKey = formatDateKey(entry.date);
          if (!acc[dateKey]) {
            acc[dateKey] = [];
          }
          acc[dateKey].push(entry);
        } catch (error) {
          console.error("Error processing entry date:", entry.date, error);
        }
        return acc;
      },
      {},
    );
    return grouped;
  }, [filteredEntries]);

  // Filter entries for active date
  const selectedEntries = useMemo(() => {
    return groupedEntries[activeDate] || [];
  }, [groupedEntries, activeDate]);

  const todayStr = getLocalDateKey();
  const isFuture = activeDate > todayStr;
  const todayEntries = groupedEntries[todayStr] || [];

  // Handle date change with loading state
  const handleDateSelect = async (dateStr: string) => {
    if (dateStr === activeDate) return;

    setIsChangingDate(true);
    setActiveDate(dateStr);

    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    onDateSelect(dateStr);
    setIsChangingDate(false);
  };

  // Handle week change with loading state
  const handleWeekChange = async (direction: "prev" | "next") => {
    setIsLoading(true);
    const current = new Date(currentWeekStart);
    current.setUTCDate(current.getUTCDate() + (direction === "prev" ? -7 : 7));
    onWeekChange(current.toISOString());

    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsLoading(false);
  };

  // Notify parent when active date changes
  useEffect(() => {
    onDateSelect(activeDate);
  }, [activeDate, onDateSelect]);

  // Calculate total acts for a date
  const getTotalActs = (dateStr: string) => {
    const entries = groupedEntries[dateStr] || [];
    return entries.reduce((sum, entry) => sum + entry.count, 0);
  };

  // Calculate unique people for a date
  const getUniquePeople = (dateStr: string) => {
    const entries = groupedEntries[dateStr] || [];
    const uniqueUsers = new Set(entries.map((entry) => entry.userId));
    return uniqueUsers.size;
  };

  // Safe user display name
  const getUserDisplayName = (entry: Entry) => {
    if (!entry.user) {
      return "Someone";
    }
    return entry.user?.loveName || entry.user?.name || "User";
  };

  return (
    <section
      id="history"
      className="glass-card relative rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 backdrop-blur-md md:p-5"
    >
      {" "}
      {/* Week Header - Mobile Responsive */}
      <div className="relative mb-4 md:mb-6">
        <div
          className="
    flex items-center justify-between 
    gap-2 sm:gap-4 
    px-1 sm:px-0
  "
        >
          {/* Prev button – fixed size, never shrinks too much */}
          <button
            onClick={() => handleWeekChange("prev")}
            disabled={isLoading}
            className="
        flex-shrink-0 p-2 sm:p-2.5 
        hover:bg-white/10 rounded-lg transition-colors 
        text-white/70 hover:text-white 
        disabled:opacity-40 disabled:cursor-not-allowed
        min-w-[40px] min-h-[40px] flex items-center justify-center
      "
            aria-label="Previous week"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Center content – takes available space */}
          <div className="flex-1 min-w-0 flex flex-col items-center">
            {/* Month & year */}
            <div
              className="
        flex items-center justify-center gap-1.5 text-xs sm:text-sm 
        text-white/60 mb-2 sm:mb-2.5
      "
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">
                {formatMonthYear(getDisplayDate(activeDate))}
              </span>
            </div>

            {/* ─── Desktop date grid ─── */}
            <div className="hidden md:flex items-center justify-center gap-2 lg:gap-3">
              {isLoading
                ? Array.from({ length: 7 }).map((_, i) => (
                    <DateSkeleton key={i} />
                  ))
                : weekDays.map((date) => {
                    const dateStr = formatDateKey(date.toISOString());
                    const isActive = activeDate === dateStr;
                    const isToday = dateStr === todayStr;
                    const hasData = !!groupedEntries[dateStr]?.length;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDateSelect(dateStr)}
                        disabled={isChangingDate}
                        className={`
                    flex flex-col items-center justify-center 
                    w-11 h-14 rounded-xl transition-all duration-300 relative
                    ${
                      isActive
                        ? "bg-gradient-to-br from-white to-white/90 text-black shadow-lg scale-105"
                        : "hover:bg-white/10 text-white/70"
                    }
                    ${isToday && !isActive ? "border border-white/25" : ""}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                      >
                        <span
                          className={`text-xs font-medium ${isActive ? "text-black/70" : "text-white/50"}`}
                        >
                          {formatDayName(date)}
                        </span>
                        <span className="text-lg font-semibold mt-0.5">
                          {formatDayNum(date)}
                        </span>
                        {isToday && !isActive && (
                          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-white/80" />
                        )}
                        {hasData && !isActive && (
                          <div className="absolute -bottom-1.5 w-2 h-2 rounded-full bg-white/50" />
                        )}
                      </button>
                    );
                  })}
            </div>

            {/* ─── Mobile scrollable date strip ─── */}

            <div
              ref={scrollRef}
              className="
    md:hidden w-full 
    overflow-x-auto scrollbar-hide 
    -mx-1 px-1
    scroll-smooth snap-x snap-mandatory
  "
            >
              <div
                className="
          inline-flex items-center gap-2 sm:gap-3 
          py-1 min-w-full justify-start
        "
              >
                {isLoading
                  ? Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="flex-shrink-0">
                        <DateSkeleton />
                      </div>
                    ))
                  : weekDays.map((date) => {
                      const dateStr = formatDateKey(date.toISOString());
                      const isActive = activeDate === dateStr;
                      const isToday = dateStr === todayStr;

                      return (
                        <button
                          key={dateStr}
                          onClick={() => handleDateSelect(dateStr)}
                          ref={(el) => (dateRefs.current[dateStr] = el)}
                          disabled={isChangingDate}
                          className={`
                      flex-shrink-0 flex flex-col items-center justify-center 
                      w-12 h-11 rounded-xl transition-all duration-300 relative
                      snap-center
                      ${
                        isActive
                          ? "bg-gradient-to-br from-white to-white/90 text-black shadow-lg scale-105"
                          : "hover:bg-white/10 text-white/70 active:bg-white/15"
                      }
                      ${isToday && !isActive ? "border-2 border-white/30" : "border border-transparent"}
                      disabled:opacity-50
                    `}
                        >
                          <span
                            className={`text-[10px] font-medium ${isActive ? "text-black/70" : "text-white/50"}`}
                          >
                            {formatDayName(date)}
                          </span>
                          <span className="text-base font-semibold mt-0.5">
                            {formatDayNum(date)}
                          </span>

                          {isToday && !isActive && (
                            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-white/80" />
                          )}
                        </button>
                      );
                    })}
              </div>
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={() => handleWeekChange("next")}
            disabled={isLoading}
            className="
        flex-shrink-0 p-2 sm:p-2.5 
        hover:bg-white/10 rounded-lg transition-colors 
        text-white/70 hover:text-white 
        disabled:opacity-40 disabled:cursor-not-allowed
        min-w-[40px] min-h-[40px] flex items-center justify-center
      "
            aria-label="Next week"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
      {/* Selected Date Header with Filter Toggle */}
      <div className="flex items-center justify-between mb-4 md:mb-5 px-1">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white/90 truncate">
              {formatFullDate(getDisplayDate(activeDate))}
            </h3>
            <div className="flex items-center gap-1.5">
              {selectedEntries.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-white/50" />
                  <span className="text-xs text-white/60">
                    {getTotalActs(activeDate)} peoples
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isFuture && (
            <div className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-white/5 border border-white/10">
              <span className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-wider">
                Future
              </span>
            </div>
          )}

          {/* Modern Toggle Switch */}
          <FilterToggle showAll={showAllEntries} onToggle={setShowAllEntries} />
        </div>
      </div>
      {/* Content Area with Loading States */}
      <div className="min-h-[150px] md:min-h-[180px]">
        {isChangingDate ? (
          // Loading skeleton for content
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <EntrySkeleton key={i} />
            ))}
          </div>
        ) : isFuture ? (
          <div className="flex flex-col items-center justify-center text-center p-6 md:p-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 md:mb-3">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white/40" />
            </div>
            <p className="text-white/80 font-medium text-sm">Coming Soon</p>
            <p className="text-xs text-white/40 mt-1 max-w-[140px] md:max-w-[160px]">
              Hold On Time Traveler , Hold on !{" "}
            </p>
          </div>
        ) : selectedEntries.length > 0 ? (
          <div className="space-y-2 max-h-56 md:max-h-64 overflow-y-auto pr-1">
            {selectedEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onEntryClick(entry)}
                className="w-full flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-xs font-medium text-white/90 truncate">
                      {getUserDisplayName(entry)}
                    </span>

                    {entry.editedAt && (
                      <span className="text-[9px] md:text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded flex-shrink-0">
                        Edited
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white/50 truncate max-w-[120px] md:max-w-[160px] mt-0.5">
                    {entry.note || "No note added"}
                  </span>
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {entry.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] md:text-[10px] bg-white/5 px-1.5 md:px-2 py-0.5 rounded-full text-white/40 truncate max-w-[60px] md:max-w-none"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 ml-2">
                  <div className="flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg bg-white/10">
                    <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-white/80" />
                    <span className="text-xs md:text-sm font-semibold text-white/80">
                      {entry.count}
                    </span>
                  </div>
                  <div className="text-white/20 group-hover:text-white/40 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 md:p-8">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 md:mb-3">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-white/30" />
            </div>
            <p className="text-white/70 font-medium text-sm">
              {showAllEntries
                ? "You Were behaving  mame!😁"
                : "You Were behaving  mame!😁"}
            </p>
            <p className="text-xs text-white/40 mt-1 max-w-[160px] md:max-w-[180px]">
              {activeDate === todayStr
                ? showAllEntries
                  ? "Quit in the west"
                  : "Start the day with admit"
                : showAllEntries
                  ? "A quiet day in the house"
                  : " "}
            </p>
          </div>
        )}
      </div>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
        </div>
      )}
    </section>
  );
}
