import { motion } from "framer-motion";
import {
  Entry,
  EntryActivitiesResponse,
  EntryActivity,
  EntryActivityType,
  ReactionKind,
} from "../types";
import { ComponentType, useEffect, useMemo, useState } from "react";
import {
  Heart,
  Smile,
  ThumbsUp,
  Frown,
  Eye,
  HandHeart,
  MessageCircleReply,
} from "lucide-react";

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
    payload?: {
      content?: string;
      reactionKind?: ReactionKind;
      parentId?: string;
      targetCommentId?: string;
    },
  ) => Promise<void>;
  onLoadActivities: (entryId: string) => Promise<EntryActivitiesResponse>;
}

const reactionConfig: Record<
  ReactionKind,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  thumbs_up: { label: "Like", icon: ThumbsUp },
  love: { label: "Love", icon: Heart },
  smile: { label: "Smile", icon: Smile },
  cry: { label: "Cry", icon: Frown },
  side_eye: { label: "Side eye", icon: Eye },
  kind: { label: "Kind", icon: HandHeart },
};

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
  const [comments, setComments] = useState<EntryActivity[]>([]);
  const [reactions, setReactions] = useState<EntryActivity[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [replyTarget, setReplyTarget] = useState<string | null>(null);
  const [newActivityIds, setNewActivityIds] = useState<string[]>([]);
  const [activeReaction, setActiveReaction] = useState<ReactionKind | null>(
    null,
  );

  const refreshActivities = async () => {
    const data = await onLoadActivities(entry.id);
    setComments(data.comments);
    setReactions(data.reactions);
    setNewActivityIds(data.comments.slice(-2).map((item) => item.id));
    window.setTimeout(() => setNewActivityIds([]), 4500);
  };

  useEffect(() => {
    refreshActivities();
  }, [entry.id]);

  const threaded = useMemo(() => {
    const roots = comments.filter((item) => item.type === "comment");
    return roots.map((root) => ({
      ...root,
      replies: comments.filter((item) => item.parentId === root.id),
    }));
  }, [comments]);

  const reactionCounts = useMemo(() => {
    return reactions.reduce(
      (acc, activity) => {
        if (activity.reactionKind) acc[activity.reactionKind] += 1;
        return acc;
      },
      {
        thumbs_up: 0,
        love: 0,
        smile: 0,
        cry: 0,
        side_eye: 0,
        kind: 0,
      } as Record<ReactionKind, number>,
    );
  }, [reactions]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      await onDelete(entry);
    }
  };

  const submitComment = async () => {
    if (!commentInput.trim()) return;
    await onAddActivity(entry.id, "comment", { content: commentInput.trim() });
    setCommentInput("");
    refreshActivities();
  };

  const submitReply = async (parentId: string) => {
    const text = replyInput[parentId]?.trim();
    if (!text) return;
    await onAddActivity(entry.id, "reply", { content: text, parentId });
    setReplyInput((prev) => ({ ...prev, [parentId]: "" }));
    setReplyTarget(null);
    refreshActivities();
  };

  const sendReaction = async (kind: ReactionKind) => {
    setActiveReaction(kind);
    await onAddActivity(entry.id, "reaction", { reactionKind: kind });
    setTimeout(() => setActiveReaction(null), 250);
    refreshActivities();
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
        className="glass-card w-[92%] max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-soft"
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
            className="rounded-full border border-white/10 px-3 py-2 text-xs hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm text-white/75">
          {entry.note && (
            <div className="rounded-xl border border-white/10 p-4">
              {entry.note}
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
                className="h-56 w-full object-cover"
              />
            </button>
          )}

          <div className="rounded-xl border border-white/10 p-4">
            <p className="mb-2 text-xs text-white/50">Reactions</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(reactionConfig).map(([kind, config]) => {
                const Icon = config.icon;
                const count = reactionCounts[kind as ReactionKind] || 0;
                const isActive = activeReaction === kind;
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => sendReaction(kind as ReactionKind)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${
                      isActive
                        ? "scale-105 border-rose-200/50 bg-rose-200/20"
                        : "border-white/15 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${count > 0 ? "fill-current" : ""}`}
                    />
                    {config.label}
                    <span className="text-white/60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 p-4">
            <p className="mb-3 text-xs text-white/50">Thread</p>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {threaded.length === 0 && (
                <p className="text-xs text-white/40">No comments yet</p>
              )}
              {threaded.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-white/10 p-3"
                >
                  <div
                    className={`${newActivityIds.includes(comment.id) ? "bg-rose-200/10" : ""} rounded-md px-2 py-1`}
                  >
                    <p className="text-xs text-white/80">{comment.content}</p>
                    <p className="mt-1 text-[10px] text-white/45">
                      {comment.actor?.loveName || comment.actor?.name} ·{" "}
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setReplyTarget(
                        replyTarget === comment.id ? null : comment.id,
                      )
                    }
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/60 hover:text-white"
                  >
                    <MessageCircleReply className="h-3 w-3" /> Reply
                  </button>

                  <div className="ml-4 mt-2 space-y-2 border-l border-white/15 pl-3">
                    {comment.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
                      >
                        <p>{reply.content}</p>
                        <p className="mt-1 text-[10px] text-white/45">
                          {reply.actor?.loveName || reply.actor?.name}
                        </p>
                      </div>
                    ))}

                    {replyTarget === comment.id && (
                      <div className="flex gap-2 pt-1">
                        <input
                          value={replyInput[comment.id] || ""}
                          onChange={(event) =>
                            setReplyInput((prev) => ({
                              ...prev,
                              [comment.id]: event.target.value,
                            }))
                          }
                          placeholder="Reply..."
                          className="flex-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => submitReply(comment.id)}
                          className="rounded-md border border-white/15 px-2 py-1 text-xs"
                        >
                          Post
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!isJudge && (
              <div className="mt-3 flex gap-2">
                <input
                  value={commentInput}
                  onChange={(event) => setCommentInput(event.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={submitComment}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs"
                >
                  Comment
                </button>
              </div>
            )}
          </div>

          {!hasDetails(entry) && (
            <p className="text-center text-xs text-white/50">
              No extra details
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => onEdit(entry)}
            disabled={entry.userId !== activeUserId || isJudge}
            className="rounded-2xl border border-white/10 px-4 py-2 text-xs disabled:opacity-40"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={entry.userId !== activeUserId || isJudge}
            className="rounded-2xl border border-white/10 px-4 py-2 text-xs text-red-300 disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}
