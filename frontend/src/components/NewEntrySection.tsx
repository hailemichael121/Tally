interface NewEntrySectionProps {
  activeUserId: string;
  isJudge: boolean;
  onNewEntry: () => void;
}

export default function NewEntrySection({
  activeUserId,
  isJudge,
  onNewEntry,
}: NewEntrySectionProps) {
  return (
    <section id="new" className="glass-card rounded-3xl p-6 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Add entry
          </p>
          <h2 className="mt-2 text-lg font-semibold">New Entry</h2>
        </div>
        <button
          onClick={onNewEntry}
          disabled={!activeUserId || isJudge}
          className="theme-btn-primary w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-colors sm:w-auto disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add Entry
        </button>
      </div>
    </section>
  );
}
