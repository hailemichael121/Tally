import { IconTrophy } from "./Icons";

interface JudgeViewProps {
  isJudge: boolean;
}

export default function JudgeView({ isJudge }: JudgeViewProps) {
  if (!isJudge) return null;

  return (
    <section className="glass-card rounded-3xl p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Judge View
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Observer Mode</h2>
          <p className="mt-2 text-sm text-white/60">
            You are viewing as judge. You cannot add entries.
          </p>
        </div>
        <span className="text-2xl text-white/70">
          <IconTrophy />
        </span>
      </div>
    </section>
  );
}
