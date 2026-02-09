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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Add entry
          </p>
          <h2 className="mt-2 text-lg font-semibold">New Entry</h2>
        </div>
        <button
          onClick={onNewEntry}
          disabled={!activeUserId || isJudge}
          className="rounded-2xl bg-cocoa px-6 py-3 text-sm font-semibold text-mist transition-colors hover:bg-cocoa/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add Entry
        </button>
      </div>
    </section>
  );
}
