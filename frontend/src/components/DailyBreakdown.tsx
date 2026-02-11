import { Entry } from "../types";
import { useState, useMemo, useEffect } from "react";
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

const EmptyStateSkeleton = () => (
  <div className="flex flex-col items-center justify-center text-center p-8 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-white/5 mb-3"></div>
    <div className="w-24 h-3 rounded-full bg-white/10 mb-2"></div>
    <div className="w-40 h-2.5 rounded-full bg-white/5"></div>
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
        border border-gray-200 bg-gray-100/80
        dark:border-white/10 dark:bg-white/5 dark:shadow-lg dark:backdrop-blur-sm
      "
    >
      {/* Mine */}
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={`
          rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200
          ${
            !showAll
              ? "bg-white text-black shadow-sm dark:bg-gradient-to-r dark:from-white dark:to-white/90 dark:text-black dark:shadow"
              : "text-gray-500 hover:text-gray-800 dark:text-white/60 dark:hover:text-white/90"
          }
        `}
      >
        Mine
      </button>

      {/* All */}
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={`
          rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200
          ${
            showAll
              ? "bg-white text-black shadow-sm dark:bg-gradient-to-r dark:from-white dark:to-white/90 dark:text-black dark:shadow"
              : "text-gray-500 hover:text-gray-800 dark:text-white/60 dark:hover:text-white/90"
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
  const [showAllEntries, setShowAllEntries] = useState(false); // Default to false (show only mine)

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
    <section className="glass-card relative rounded-2xl p-4 md:p-5 border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md">
      {/* Week Header - Mobile Responsive */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <button
          onClick={() => handleWeekChange("prev")}
          disabled={isLoading}
          className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 md:gap-2 text-xs md:text-sm text-white/60 mb-1">
            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
            <span>{formatMonthYear(getDisplayDate(activeDate))}</span>
          </div>

          {/* Desktop Date Grid */}
          <div className="hidden md:flex items-center justify-center gap-2 md:gap-3">
            {isLoading
              ? // Loading skeleton for dates
                Array.from({ length: 7 }).map((_, i) => (
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
                      flex flex-col items-center justify-center w-10 h-12 md:w-11 md:h-14 rounded-xl transition-all duration-300 relative
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        isActive
                          ? "bg-gradient-to-br from-white to-white/90 text-black shadow-lg scale-105"
                          : "hover:bg-white/10 text-white/70"
                      }
                      ${isToday && !isActive ? "border border-white/20" : ""}
                    `}
                    >
                      <span
                        className={`text-[10px] md:text-xs font-medium ${isActive ? "text-black/60" : "text-white/50"}`}
                      >
                        {formatDayName(date)}
                      </span>
                      <span className="text-base md:text-lg font-semibold mt-0.5">
                        {formatDayNum(date)}
                      </span>

                      {/* Today indicator */}
                      {isToday && !isActive && (
                        <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-blush/80" />
                      )}

                      {/* Dot indicator for data */}
                      {hasData && !isActive && (
                        <div className="absolute -bottom-1.5 w-2 h-2 rounded-full bg-white/40"></div>
                      )}
                    </button>
                  );
                })}
          </div>

          {/* Mobile Date Grid (Smaller, Horizontal Scroll) */}
          <div className="md:hidden flex items-center justify-center gap-1.5 overflow-x-auto pb-2 px-2">
            {isLoading
              ? // Mobile loading skeleton
                Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0">
                    <DateSkeleton />
                  </div>
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
                      flex-shrink-0 flex flex-col items-center justify-center w-9 h-10 rounded-lg transition-all duration-300 relative
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        isActive
                          ? "bg-gradient-to-br from-white to-white/90 text-black shadow-lg scale-105"
                          : "hover:bg-white/10 text-white/70"
                      }
                      ${isToday && !isActive ? "border border-white/20" : ""}
                    `}
                    >
                      <span
                        className={`text-[9px] font-medium ${isActive ? "text-black/60" : "text-white/50"}`}
                      >
                        {formatDayName(date)}
                      </span>
                      <span className="text-sm font-semibold mt-0.5">
                        {formatDayNum(date)}
                      </span>

                      {/* Today indicator for mobile */}
                      {isToday && !isActive && (
                        <div className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-blush/80" />
                      )}
                    </button>
                  );
                })}
          </div>
        </div>

        <button
          onClick={() => handleWeekChange("next")}
          disabled={isLoading}
          className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
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
              The future holds possibilities. Live in the present.
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
                  <div className="flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg bg-blush/10">
                    <Users className="w-2.5 h-2.5 md:w-3 md:h-3 text-blush/80" />
                    <span className="text-xs md:text-sm font-semibold text-blush/80">
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
              {showAllEntries ? "No Acts Today" : "No Acts from You Today"}
            </p>
            <p className="text-xs text-white/40 mt-1 max-w-[160px] md:max-w-[180px]">
              {activeDate === todayStr
                ? showAllEntries
                  ? "No one has added acts yet"
                  : "Start the day with an act of love"
                : showAllEntries
                  ? "A quiet day in the love journal"
                  : "You didn't log any acts this day"}
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
