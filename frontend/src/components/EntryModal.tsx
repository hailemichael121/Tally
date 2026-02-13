import { motion } from "framer-motion";
import { Entry, EntryActivity, EntryActivityType } from "../types";
import { useEffect, useMemo, useState } from "react";

interface EntryModalProps {
  entry: Entry;
  activeUserId: string;
  isJudge: boolean;
  onClose: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  onImageClick: (url: string) => void;
  onAddActivity: (
    entryId: string,
    type: EntryActivityType,
    content?: string,
  ) => Promise<void>;
  onLoadActivities: (entryId: string) => Promise<EntryActivity[]>;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const hasDetails = (entry: Entry) =>
  Boolean(entry.note || entry.tags?.length || entry.imageUrl);

export default function EntryModal({
  entry,
  activeUserId,
  isJudge,
  onClose,
  onEdit,
  onDelete,
  onImageClick,
  onAddActivity,
  onLoadActivities,
}: EntryModalProps) {
  const [activities, setActivities] = useState<EntryActivity[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [newActivityIds, setNewActivityIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    onLoadActivities(entry.id).then((data) => {
      if (!mounted) return;
      setActivities(data);
      const latestIds = data.slice(-2).map((item) => item.id);
      setNewActivityIds(latestIds);
      window.setTimeout(() => setNewActivityIds([]), 4500);
    });

    return () => {
      mounted = false;
    };
  }, [entry.id, onLoadActivities]);

  const groupedComments = useMemo(
    () => activities.filter((activity) => activity.type !== "reaction"),
    [activities],
  );

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      await onDelete(entry);
    }
  };

  const submitComment = async (type: EntryActivityType) => {
    if (!commentInput.trim()) return;
    await onAddActivity(entry.id, type, commentInput.trim());
    const data = await onLoadActivities(entry.id);
    setActivities(data);
    setCommentInput("");
  };

  const addReaction = async () => {
    await onAddActivity(entry.id, "reaction");
    const data = await onLoadActivities(entry.id);
    setActivities(data);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div
        className="glass-card w-[90%] max-w-md max-h-[85vh] overflow-y-auto rounded-3xl p-6 shadow-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Entry
            </p>
            <h3 className="mt-2 text-lg font-semibold">
              {entry.user?.loveName || entry.user?.name || "User"}
            </h3>
            <p className="text-xs text-white/50">
              {formatDate(entry.date)} • {entry.count}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-2 text-xs transition-colors hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 text-sm text-white/70">
          {entry.note && (
            <div className="rounded-xl border border-white/10 p-4">
              <p className="mb-2 text-xs text-white/50">Note</p>
              <p>{entry.note}</p>
            </div>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <div className="rounded-xl border border-white/10 p-4">
              <p className="mb-2 text-xs text-white/50">Tags</p>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.imageUrl && (
            <button
              type="button"
              onClick={() => onImageClick(entry.imageUrl!)}
              className="overflow-hidden rounded-xl border border-white/10"
            >
              <img
                src={entry.imageUrl}
                alt="entry"
                className="h-48 w-full object-cover"
              />
            </button>
          )}

          <div className="rounded-xl border border-white/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs text-white/50">Activity</p>
              <button
                type="button"
                onClick={addReaction}
                className="rounded-full border border-white/15 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
              >
                ❤️ React
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {groupedComments.length === 0 && (
                <p className="text-xs text-white/40">No comments yet</p>
              )}
              {groupedComments.map((activity) => (
                <div
                  key={activity.id}
                  className={`rounded-lg px-3 py-2 text-xs transition-colors ${
                    newActivityIds.includes(activity.id)
                      ? "bg-rose-200/10 border border-rose-200/20"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <p className="text-white/80">{activity.content}</p>
                  <p className="mt-1 text-[10px] text-white/40">
                    {activity.actor?.loveName || activity.actor?.name || "User"} •{" "}
                    {new Date(activity.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>

            {!isJudge && (
              <div className="mt-3 flex gap-2">
                <input
                  value={commentInput}
                  onChange={(event) => setCommentInput(event.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  disabled={!commentInput.trim() || !activeUserId}
                  onClick={() => submitComment("comment")}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/85 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            )}
          </div>

          {!hasDetails(entry) && (
            <p className="py-1 text-center text-xs text-white/50">No extra details</p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => onEdit(entry)}
            disabled={entry.userId !== activeUserId || isJudge}
            className="rounded-2xl border border-white/10 px-4 py-2 text-xs text-white/70 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={entry.userId !== activeUserId || isJudge}
            className="rounded-2xl border border-white/10 px-4 py-2 text-xs text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}
