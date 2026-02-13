import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Entry, EntryComment } from "../types";

interface EntryModalProps {
  entry: Entry;
  activeUserId: string;
  isJudge: boolean;
  onClose: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  onImageClick: (url: string) => void;
}

const API_URL = "https://tally-bibx.onrender.com";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

export default function EntryModal({
  entry,
  activeUserId,
  isJudge,
  onClose,
  onEdit,
  onDelete,
  onImageClick,
}: EntryModalProps) {
  const [comments, setComments] = useState<EntryComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [highlightCutoff, setHighlightCutoff] = useState<Date | null>(
    entry.lastSeenAt ? new Date(entry.lastSeenAt) : null,
  );

  const reactionEntries = useMemo(
    () => Object.entries(entry.reactionGroups || {}),
    [entry.reactionGroups],
  );

  const loadComments = async () => {
    const response = await fetch(`${API_URL}/entries/${entry.id}/comments`);
    if (response.ok) {
      const data = (await response.json()) as EntryComment[];
      setComments(data);
    }
  };

  useEffect(() => {
    loadComments();
    const timer = setTimeout(() => setHighlightCutoff(null), 4000);
    return () => clearTimeout(timer);
  }, [entry.id]);

  const submitComment = async () => {
    if (!commentInput.trim() || !activeUserId) return;

    const response = await fetch(`${API_URL}/entries/${entry.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: activeUserId,
        content: commentInput.trim(),
        parentId: replyTo || undefined,
      }),
    });

    if (response.ok) {
      setCommentInput("");
      setReplyTo(null);
      await loadComments();
    }
  };

  const toggleReaction = async (emoji: string) => {
    if (!activeUserId) return;
    await fetch(`${API_URL}/entries/${entry.id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: activeUserId, emoji }),
    });
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
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Entry</p>
            <h3 className="mt-2 text-lg font-semibold">{entry.user?.loveName || entry.user?.name || "User"}</h3>
            <p className="text-xs text-white/50">{formatDate(entry.date)} • {entry.count}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 px-3 py-2 text-xs transition-colors hover:bg-white/10">Close</button>
        </div>

        {entry.imageUrl && (
          <button type="button" onClick={() => onImageClick(entry.imageUrl!)} className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <img src={entry.imageUrl} alt="entry" className="h-48 w-full object-cover" />
          </button>
        )}

        <div className="mt-4 flex gap-2">
          {["❤️", "🔥", "👏"].map((emoji) => (
            <button key={emoji} onClick={() => toggleReaction(emoji)} className="rounded-full border border-white/10 px-3 py-1 text-sm hover:bg-white/10">
              {emoji}
            </button>
          ))}
          <div className="text-xs text-white/60 self-center">
            {reactionEntries.map(([emoji, count]) => `${emoji} ${count}`).join("  ") || "No reactions"}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {comments.map((comment) => {
            const isNew =
              highlightCutoff && new Date(comment.createdAt).getTime() > highlightCutoff.getTime();

            return (
              <div key={comment.id} className={`rounded-xl border border-white/10 p-3 ${isNew ? "bg-rose-200/10" : ""}`}>
                <p className="text-xs text-white/60">{comment.user?.loveName || comment.user?.name || "Someone"}</p>
                <p className="text-sm text-white/85">{comment.content}</p>
                <button className="mt-1 text-[11px] text-white/50 hover:text-white/80" onClick={() => setReplyTo(comment.id)}>
                  Reply
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-white/10 p-3">
          {replyTo && <p className="mb-1 text-[11px] text-white/50">Replying to a comment</p>}
          <textarea
            value={commentInput}
            onChange={(event) => setCommentInput(event.target.value)}
            className="w-full rounded-lg bg-white/5 p-2 text-sm outline-none"
            placeholder="Write a comment..."
            rows={3}
          />
          <div className="mt-2 flex justify-end gap-2">
            {replyTo && (
              <button className="rounded-lg border border-white/10 px-3 py-1 text-xs" onClick={() => setReplyTo(null)}>
                Cancel reply
              </button>
            )}
            <button className="rounded-lg border border-white/10 px-3 py-1 text-xs hover:bg-white/10" onClick={submitComment}>
              Post
            </button>
          </div>
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
            onClick={async () => {
              if (window.confirm("Are you sure you want to delete this entry?")) {
                await onDelete(entry);
              }
            }}
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
