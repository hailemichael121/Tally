import { Entry } from "../types";

interface DailyBreakdownProps {
  entries: Entry[];
  selectedWeekStart: string;
  onWeekChange: (weekStart: string) => void;
  onEntryClick: (entry: Entry) => void;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const weekStartFromDate = (value: string) => {
  const date = new Date(value);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
};

export default function DailyBreakdown({
  entries,
  selectedWeekStart,
  onWeekChange,
  onEntryClick,
}: DailyBreakdownProps) {
  const groupedEntries = entries.reduce<Record<string, Entry[]>>(
    (acc, entry) => {
      const key = formatDate(entry.date);
      acc[key] = acc[key] ? [...acc[key], entry] : [entry];
      return acc;
    },
    {},
  );

  return (
    <section id="history" className="glass-card rounded-3xl p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Daily Breakdown</h2>
        <input
          type="date"
          className="soft-input"
          value={selectedWeekStart ? selectedWeekStart.slice(0, 10) : ""}
          onChange={(event) => {
            const value = event.target.value;
            onWeekChange(value ? weekStartFromDate(value) : "");
          }}
        />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {Object.entries(groupedEntries).length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-white/60">No entries yet</p>
            <p className="mt-1 text-xs text-white/40">
              Start by adding your first act of love!
            </p>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([date, dayEntries]) => (
            <div
              key={date}
              className="rounded-3xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                {date}
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {dayEntries.map((entry) => (
                  <button
                    type="button"
                    key={entry.id}
                    onClick={() => onEntryClick(entry)}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm">{entry.user.loveName}</p>
                      <p className="text-xs text-white/50">
                        Count: {entry.count}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      {entry.editedAt && (
                        <span className="rounded-full border border-white/10 px-2 py-1">
                          Edited
                        </span>
                      )}
                      <span className="text-lg">›</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
