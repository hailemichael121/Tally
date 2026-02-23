import { motion } from "framer-motion";
import clsx from "clsx";
import { User, WeeklySummary } from "../types";
import { IconCrown } from "./Icons";

interface WeeklyStatusProps {
  activeUserId: string;
  users: User[];
  weeklySummary: WeeklySummary | null;
  isJudge: boolean;
}

export default function WeeklyStatus({
  activeUserId,
  users,
  weeklySummary,
  isJudge,
}: WeeklyStatusProps) {
  // Filter out judge and yeabsra from comparison
  const displayUsers = users.filter(
    (user) => user.id !== "judge" && user.id !== "yeabsra",
  );

  // Get the two players for comparison
  const player1 = displayUsers[0];
  const player2 = displayUsers[1];

  if (!player1 || !player2 || !weeklySummary) return null;

  const player1Total = weeklySummary.totals[player1.id] ?? 0;
  const player2Total = weeklySummary.totals[player2.id] ?? 0;

  // Determine who is winning (lower score wins)
  const player1Winning = player1Total < player2Total;
  const player2Winning = player2Total < player1Total;
  const tie = player1Total === player2Total;

  // For judge view, always show comparison
  // For regular users, show personal comparison
  const isPersonalView = !isJudge;

  let status: {
    title: string;
    description: string;
    icon: string;
    color: string;
    borderColor: string;
    bgColor: string;
  } | null = null;

  if (isJudge) {
    // Judge sees who is winning overall
    if (tie) {
      status = {
        title: "It's a Tie! 🎊",
        description: `Both at ${player1Total}`,
        icon: "⚖️",
        color: "text-white",
        borderColor: "border-white/20",
        bgColor: "bg-white/10",
      };
    } else if (player1Winning) {
      status = {
        title: `${player1.loveName} is Winning! 🎉`,
        description: `Leading by ${player2Total - player1Total} points`,
        icon: "🏆",
        color: "text-green-300",
        borderColor: "border-green-500/20",
        bgColor: "bg-green-500/10",
      };
    } else {
      status = {
        title: `${player2.loveName} is Winning! 🎉`,
        description: `Leading by ${player1Total - player2Total} points`,
        icon: "🏆",
        color: "text-green-300",
        borderColor: "border-green-500/20",
        bgColor: "bg-green-500/10",
      };
    }
  } else {
    // Regular user sees their personal status
    const myTotal = weeklySummary.totals[activeUserId] ?? 0;
    const otherUser = displayUsers.find((u) => u.id !== activeUserId);
    const otherTotal = weeklySummary.totals[otherUser?.id || ""] ?? 0;
    const difference = myTotal - otherTotal;

    if (tie) {
      status = {
        title: "It's a Tie! 🎊",
        description: `Both at ${myTotal}`,
        icon: "⚖️",
        color: "text-white",
        borderColor: "border-white/20",
        bgColor: "bg-white/10",
      };
    } else if (difference < 0) {
      status = {
        title: "You're Winning! 🎉",
        description: `Leading by ${Math.abs(difference)} points`,
        icon: "🏆",
        color: "text-green-300",
        borderColor: "border-green-500/20",
        bgColor: "bg-green-500/10",
      };
    } else {
      status = {
        title: "Keep Going! 💪",
        description: `Behind by ${difference} points`,
        icon: "🔥",
        color: "text-amber-300",
        borderColor: "border-amber-500/20",
        bgColor: "bg-amber-500/10",
      };
    }
  }

  if (!status) return null;

  const antLogo =
    "https://gw.alipayobjects.com/zos/rmsportal/ODTLcjxAfvqbxHnVXCYX.png";

  return (
    <div className="glass-card rounded-3xl border-2 border-white/20 p-6 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            Weekly Status
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isJudge ? "Current Standings" : "Your Position"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <img src={antLogo} alt="Ant Design" className="ant-logo h-7 w-7 rounded-full border border-white/20 bg-white/80 p-1" />
          <span className="text-2xl text-white/70">
            <IconCrown />
          </span>
        </div>
      </div>

      <motion.div
        className={`mt-6 rounded-3xl border-2 ${status.borderColor} ${status.bgColor} bg-[radial-gradient(circle_at_top,_rgba(255,255,255,.22),_transparent_70%)] p-4`}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-xl font-semibold ${status.color}`}>
              {status.title}
            </h3>
          </div>
          <span className="rounded-2xl bg-white/10 px-3 py-2 text-lg text-white/70">
            {status.icon}
          </span>
        </div>
        <div className="mt-2 text-xs text-white/50">{status.description}</div>
      </motion.div>

      {/* Head-to-Head Comparison */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,.15),_transparent_65%)] p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
          Head-to-Head
        </p>
        <div className="mt-3 space-y-2">
          {/* Player 1 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white/70">{player1.loveName}</span>
              {isJudge && player1Winning && (
                <span className="text-xs text-green-300">🏆</span>
              )}
            </div>
            <span
              className={clsx(
                "font-semibold",
                isJudge && player1Winning ? "text-green-300" : "text-white/70",
              )}
            >
              {player1Total}
            </span>
          </div>

          {/* Player 2 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-white/70">{player2.loveName}</span>
              {isJudge && player2Winning && (
                <span className="text-xs text-green-300">🏆</span>
              )}
            </div>
            <span
              className={clsx(
                "font-semibold",
                isJudge && player2Winning ? "text-green-300" : "text-white/70",
              )}
            >
              {player2Total}
            </span>
          </div>

          {/* Difference */}
          <div className="mt-2 flex items-center justify-between text-sm border-t border-white/10 pt-2">
            <span className="text-white/70">Difference</span>
            <span
              className={clsx(
                "font-semibold",
                player1Winning
                  ? "text-green-300"
                  : player2Winning
                    ? "text-green-300"
                    : "text-white/70",
              )}
            >
              {player1Total - player2Total >= 0 ? "+" : ""}
              {player1Total - player2Total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
