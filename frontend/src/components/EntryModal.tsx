// components/EntryModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import {
  Entry,
  EntryActivitiesResponse,
  EntryActivity,
  EntryActivityType,
  ReactionKind,
  User,
} from "../types";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Plus,
  X,
  MessageCircleReply,
  Image,
  Smile,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/scrollbar";

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

// Types
type CommentWithReplies = EntryActivity & {
  replies: CommentWithReplies[];
};

type ReactionCounts = Record<ReactionKind, number>;

// Reaction configuration
const reactionConfig: Record<
  ReactionKind,
  { label: string; emoji: string; color: string }
> = {
  thumbs_up: { label: "Like", emoji: "👍", color: "text-blue-400" },
  love: { label: "Thumbs down", emoji: "👎", color: "text-sky-400" },
  smile: { label: "Angry", emoji: "😡", color: "text-yellow-400" },
  cry: { label: "Sad", emoji: "😢", color: "text-indigo-400" },
  side_eye: { label: "Shock", emoji: "😮", color: "text-purple-400" },
  kind: { label: "Celebrate", emoji: "🎉", color: "text-emerald-400" },
};

const primaryReactions: ReactionKind[] = ["thumbs_up", "love", "smile"];

const extraReactionPicker: { kind: ReactionKind; emoji: string }[] = [
  { kind: "cry", emoji: "😢" },
  { kind: "cry", emoji: "😭" },
  { kind: "cry", emoji: "🥹" },
  { kind: "side_eye", emoji: "😮" },
  { kind: "side_eye", emoji: "🤯" },
  { kind: "side_eye", emoji: "😳" },
  { kind: "kind", emoji: "🎉" },
  { kind: "kind", emoji: "✨" },
  { kind: "kind", emoji: "🔥" },
  { kind: "kind", emoji: "🙌" },
  { kind: "kind", emoji: "💯" },
  { kind: "kind", emoji: "👏" },
];

const extendedReactions: {
  kind: ReactionKind;
  emoji: string;
  label: string;
}[] = Object.entries(reactionConfig).map(([kind, config]) => ({
  kind: kind as ReactionKind,
  emoji: config.emoji,
  label: config.label,
}));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const ANT_LOGO = "https://gw.alipayobjects.com/zos/rmsportal/ODTLcjxAfvqbxHnVXCYX.png";

// Helper to build nested comment tree
const buildCommentTree = (comments: EntryActivity[]): CommentWithReplies[] => {
  const commentMap = new Map<string, CommentWithReplies>();
  const roots: CommentWithReplies[] = [];

  // First pass: create map with replies array
  comments.forEach((comment) => {
    if (comment.type === "comment" || comment.type === "reply") {
      commentMap.set(comment.id, { ...comment, replies: [] });
    }
  });

  // Second pass: build tree
  comments.forEach((comment) => {
    if (comment.type === "comment" || comment.type === "reply") {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(commentWithReplies);
      } else if (!comment.parentId && comment.type === "comment") {
        roots.push(commentWithReplies);
      }
    }
  });

  return roots;
};

// Helper to create a minimal user object for optimistic updates
const createOptimisticUser = (userId: string, name: string = "You"): User => ({
  id: userId,
  name: name,
  loveName: name,
  track: "",
});

// Reaction button component with TikTok-like effect
const ReactionButton = ({
  kind,
  emoji,
  label,
  count,
  isActive,
  onClick,
  size = "default",
}: {
  kind: ReactionKind;
  emoji: string;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  size?: "small" | "default";
}) => {
  const [showEffect, setShowEffect] = useState(false);
  const timeoutRef = useRef<number>();

  const handleClick = () => {
    onClick();
    setShowEffect(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setShowEffect(false), 500);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`
          relative flex items-center gap-1 rounded-full transition-all duration-200
          ${size === "small" ? "px-1.5 py-0.5 text-xs" : "px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm"}
          ${
            isActive
              ? "scale-105 border border-fuchsia-400/60 bg-fuchsia-500/20 shadow-[0_0_0_2px_rgba(217,70,239,.2)]"
              : "border border-white/15 bg-white/5 hover:bg-white/10"
          }
        `}
        title={label}
      >
        <span className={size === "small" ? "text-sm" : "text-sm sm:text-base"}>
          {emoji}
        </span>
        {count > 0 && (
          <span
            className={`${size === "small" ? "text-[8px]" : "text-[10px] sm:text-xs"} ${
              isActive ? "text-fuchsia-100 dark:text-fuchsia-200" : "text-white/60"
            }`}
          >
            {count}
          </span>
        )}
      </button>

      {/* TikTok-like flare effect */}
      <AnimatePresence>
        {showEffect && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none rounded-full bg-fuchsia-400/30"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Recursive component for infinite nested replies with mobile responsiveness
const ReplyThread = ({
  comment,
  depth = 0,
  activeUserId,
  isJudge,
  onReply,
  onAddReaction,
  reactionMap,
  setReactionMap,
  replyInput,
  setReplyInput,
  replyTarget,
  setReplyTarget,
  submittingReply,
  allActivities,
}: {
  comment: CommentWithReplies;
  depth: number;
  activeUserId: string;
  isJudge: boolean;
  onReply: (parentId: string, content: string) => Promise<void>;
  onAddReaction: (kind: ReactionKind, targetCommentId: string) => Promise<void>;
  reactionMap: Record<string, ReactionKind | null>;
  setReactionMap: React.Dispatch<
    React.SetStateAction<Record<string, ReactionKind | null>>
  >;
  replyInput: Record<string, string>;
  setReplyInput: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  replyTarget: string | null;
  setReplyTarget: React.Dispatch<React.SetStateAction<string | null>>;
  submittingReply: boolean;
  allActivities: EntryActivity[];
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(depth > 2);
  const reactionPickerRef = useRef<HTMLDivElement>(null);

  const hasReplies = comment.replies.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(event.target as Node)
      ) {
        setShowReactions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReplySubmit = async () => {
    if (!replyInput[comment.id]?.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onReply(comment.id, replyInput[comment.id].trim());
    setReplyInput((prev) => ({ ...prev, [comment.id]: "" }));
    setReplyTarget(null);
    setIsSubmitting(false);
  };

  const handleReaction = async (kind: ReactionKind) => {
    const currentReaction = reactionMap[comment.id];
    const newReaction = currentReaction === kind ? null : kind;

    setReactionMap((prev) => ({
      ...prev,
      [comment.id]: newReaction,
    }));

    setShowReactions(false);
    await onAddReaction(kind, comment.id);
  };

  const userReaction = reactionMap[comment.id];

  const commentReactions = useMemo(() => {
    return allActivities.filter(
      (c) => c.targetCommentId === comment.id && c.type === "reaction",
    );
  }, [allActivities, comment.id]);

  const reactionCounts = useMemo(() => {
    const counts: Partial<Record<ReactionKind, number>> = {};
    commentReactions.forEach((r) => {
      if (r.reactionKind) {
        counts[r.reactionKind] = (counts[r.reactionKind] || 0) + 1;
      }
    });
    return counts;
  }, [commentReactions]);

  const sortedReactionCounts = useMemo(() => {
    return Object.entries(reactionCounts).sort(([, countA], [, countB]) => {
      if (countA !== countB) return countB - countA;
      return 0;
    });
  }, [reactionCounts]);

  const maxDepth = 10;
  if (depth > maxDepth) return null;

  const replyCount = comment.replies.length;

  const indentClass =
    depth === 0
      ? ""
      : depth === 1
        ? "ml-2 sm:ml-3 md:ml-4"
        : "ml-1 sm:ml-2 md:ml-3";

  return (
    <div className="relative">
      <div
        className={`
          rounded-lg border border-white/10 bg-white/5 p-2 sm:p-3
          ${depth > 0 ? "mt-2" : ""}
        `}
      >
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-rose-400/30 to-purple-400/30 flex items-center justify-center text-xs sm:text-sm">
            {comment.actor?.loveName?.[0] || comment.actor?.name?.[0] || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-medium text-white/90 break-words">
                  {comment.actor?.loveName || comment.actor?.name}
                  {depth > 0 && (
                    <span className="ml-1.5 text-[10px] text-white/30">
                      · replied
                    </span>
                  )}
                </p>

                <p className="mt-1 text-xs sm:text-sm text-white/80 break-words whitespace-pre-wrap">
                  {comment.content}
                </p>

                {Object.keys(reactionCounts).length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {sortedReactionCounts.map(([kind, count]) => (
                      <span
                        key={kind}
                        className={`
                          inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] sm:text-xs
                          ${userReaction === kind ? "border border-fuchsia-400/60 bg-fuchsia-500/20 text-fuchsia-100" : "border border-white/10 bg-white/5"}
                        `}
                        title={reactionConfig[kind as ReactionKind]?.label}
                      >
                        <span>
                          {reactionConfig[kind as ReactionKind]?.emoji}
                        </span>
                        <span className="text-white/60">{count}</span>
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-1.5 text-[8px] sm:text-[10px] text-white/40">
                  {formatTime(comment.createdAt)}
                </p>
              </div>

              {!isJudge && activeUserId !== comment.actorId && (
                <div className="relative flex-shrink-0" ref={reactionPickerRef}>
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className="rounded-full p-1.5 hover:bg-white/10 transition-colors"
                  >
                    <Smile className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/60" />
                  </button>

                  <AnimatePresence>
                    {showReactions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="absolute right-0 top-8 z-20 flex gap-1 rounded-xl border border-white/10 bg-ink/95 p-1.5 shadow-xl backdrop-blur-md"
                      >
                        {extendedReactions.map(({ kind, emoji }) => (
                          <button
                            key={kind}
                            onClick={() => handleReaction(kind)}
                            className={`
                              rounded-lg p-1.5 sm:p-2 text-base sm:text-lg transition-all
                              ${userReaction === kind ? "scale-110 bg-fuchsia-500/20 ring-2 ring-fuchsia-400/60" : "hover:bg-white/10"}
                            `}
                            title={kind}
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {!isJudge && (
              <div className="mt-2 flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() =>
                    setReplyTarget(
                      replyTarget === comment.id ? null : comment.id,
                    )
                  }
                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  <MessageCircleReply className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  Reply
                </button>

                {replyCount > 0 && (
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    {isCollapsed ? (
                      <>
                        <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span>
                          {replyCount} {replyCount === 1 ? "reply" : "replies"}
                        </span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span>Hide</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            <AnimatePresence>
              {replyTarget === comment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <div className="flex gap-2">
                    <input
                      value={replyInput[comment.id] || ""}
                      onChange={(e) =>
                        setReplyInput((prev) => ({
                          ...prev,
                          [comment.id]: e.target.value,
                        }))
                      }
                      placeholder="Write a reply..."
                      className="flex-1 rounded-lg border border-white/15 bg-white/5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm"
                      disabled={submittingReply}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleReplySubmit();
                        }
                      }}
                    />
                    <button
                      onClick={handleReplySubmit}
                      disabled={
                        !replyInput[comment.id]?.trim() || submittingReply
                      }
                      className="rounded-lg border border-white/15 px-2 sm:px-3 py-1.5 text-xs sm:text-sm disabled:opacity-40 whitespace-nowrap"
                    >
                      Post
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && hasReplies && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`
              relative mt-2 space-y-2 
              border-l-2 border-white/10 pl-2 sm:pl-3
              ${indentClass}
            `}
          >
            {comment.replies.map((reply) => (
              <ReplyThread
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                activeUserId={activeUserId}
                isJudge={isJudge}
                onReply={onReply}
                onAddReaction={onAddReaction}
                reactionMap={reactionMap}
                setReactionMap={setReactionMap}
                replyInput={replyInput}
                setReplyInput={setReplyInput}
                replyTarget={replyTarget}
                setReplyTarget={setReplyTarget}
                submittingReply={submittingReply}
                allActivities={allActivities}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  const [showMoreReactions, setShowMoreReactions] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [activeReaction, setActiveReaction] = useState<ReactionKind | null>(
    null,
  );
  const [images, setImages] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [reactionMap, setReactionMap] = useState<
    Record<string, ReactionKind | null>
  >({});

  const [entryReaction, setEntryReaction] = useState<ReactionKind | null>(null);
  const [entryReactionCounts, setEntryReactionCounts] =
    useState<ReactionCounts>({
      thumbs_up: 0,
      love: 0,
      smile: 0,
      cry: 0,
      side_eye: 0,
      kind: 0,
    });

  const moreReactionsRef = useRef<HTMLDivElement>(null);

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  const displayNames = useMemo(
    () =>
      entry.tags
        .flatMap((tag) => tag.split(","))
        .map((name) => name.trim())
        .filter(Boolean),
    [entry.tags],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreReactionsRef.current &&
        !moreReactionsRef.current.contains(event.target as Node)
      ) {
        setShowMoreReactions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshActivities = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const data = await onLoadActivities(entry.id);
      setComments(data.comments);
      setReactions(data.reactions);

      const newReactionMap: Record<string, ReactionKind | null> = {};
      const newEntryCounts: ReactionCounts = {
        thumbs_up: 0,
        love: 0,
        smile: 0,
        cry: 0,
        side_eye: 0,
        kind: 0,
      };

      let userEntryReaction: ReactionKind | null = null;

      data.reactions.forEach((r) => {
        if (r.targetCommentId) {
          if (r.actorId === activeUserId) {
            newReactionMap[r.targetCommentId] = r.reactionKind;
          }
        } else {
          if (r.reactionKind) {
            newEntryCounts[r.reactionKind] += 1;
          }
          if (r.actorId === activeUserId) {
            userEntryReaction = r.reactionKind;
          }
        }
      });

      setReactionMap(newReactionMap);
      setEntryReactionCounts(newEntryCounts);
      setEntryReaction(userEntryReaction);
    } finally {
      setIsRefreshing(false);
    }
  }, [entry.id, onLoadActivities, activeUserId]);

  useEffect(() => {
    refreshActivities();
  }, [refreshActivities]);

  useEffect(() => {
    if (entry.imageUrl) {
      setImages([entry.imageUrl]);
    }
  }, [entry.imageUrl]);

  const handleAddReaction = useCallback(
    async (kind: ReactionKind, targetCommentId?: string) => {
      if (targetCommentId) {
        const currentReaction = reactionMap[targetCommentId];
        const newReaction = currentReaction === kind ? null : kind;

        setReactionMap((prev) => ({
          ...prev,
          [targetCommentId]: newReaction,
        }));

        setReactions((prev) => {
          const filtered = prev.filter(
            (r) =>
              !(
                r.actorId === activeUserId &&
                r.targetCommentId === targetCommentId
              ),
          );

          if (newReaction) {
            filtered.push({
              id: `temp-${Date.now()}`,
              entryId: entry.id,
              actorId: activeUserId,
              type: "reaction",
              content: null,
              reactionKind: newReaction,
              parentId: null,
              targetCommentId,
              createdAt: new Date().toISOString(),
              actor: createOptimisticUser(activeUserId),
            });
          }

          return filtered;
        });
      }

      setActiveReaction(kind);
      // Fix: Pass undefined instead of null for optional parameters
      await onAddActivity(entry.id, "reaction", {
        reactionKind: kind,
        ...(targetCommentId ? { targetCommentId } : {}),
      });
      setTimeout(() => setActiveReaction(null), 250);

    },
    [entry.id, onAddActivity, activeUserId, reactionMap],
  );

  const handleEntryReaction = useCallback(
    async (kind: ReactionKind) => {
      const newReaction = entryReaction === kind ? null : kind;

      setEntryReaction(newReaction);

      setEntryReactionCounts((prev) => {
        const newCounts = { ...prev };

        if (entryReaction) {
          newCounts[entryReaction] = Math.max(0, newCounts[entryReaction] - 1);
        }

        if (newReaction) {
          newCounts[newReaction] += 1;
        }

        return newCounts;
      });

      setReactions((prev) => {
        const filtered = prev.filter(
          (r) => !(r.actorId === activeUserId && !r.targetCommentId),
        );

        if (newReaction) {
          filtered.push({
            id: `temp-${Date.now()}`,
            entryId: entry.id,
            actorId: activeUserId,
            type: "reaction",
            content: null,
            reactionKind: newReaction,
            parentId: null,
            targetCommentId: null,
            createdAt: new Date().toISOString(),
            actor: createOptimisticUser(activeUserId),
          });
        }

        return filtered;
      });

      setActiveReaction(kind);
      // Fix: Pass undefined instead of null for optional parameters
      await onAddActivity(entry.id, "reaction", { reactionKind: kind });
      setTimeout(() => setActiveReaction(null), 250);

    },
    [entry.id, entryReaction, onAddActivity, activeUserId],
  );

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;

    const content = commentInput.trim();
    const tempComment: EntryActivity = {
      id: `temp-${Date.now()}`,
      entryId: entry.id,
      actorId: activeUserId,
      type: "comment",
      content,
      reactionKind: null,
      parentId: null,
      targetCommentId: null,
      createdAt: new Date().toISOString(),
      actor: createOptimisticUser(activeUserId),
    };

    setComments((prev) => [...prev, tempComment]);
    setCommentInput("");

    // Fix: Pass only content, parentId and targetCommentId are omitted (undefined)
    await onAddActivity(entry.id, "comment", { content });
    refreshActivities();
  };

  const handleAddReply = async (parentId: string, content: string) => {
    setSubmittingReply(true);

    const tempReply: EntryActivity = {
      id: `temp-${Date.now()}`,
      entryId: entry.id,
      actorId: activeUserId,
      type: "reply",
      content,
      reactionKind: null,
      parentId,
      targetCommentId: null,
      createdAt: new Date().toISOString(),
      actor: createOptimisticUser(activeUserId),
    };

    setComments((prev) => [...prev, tempReply]);
    setReplyInput((prev) => ({ ...prev, [parentId]: "" }));
    setReplyTarget(null);

    await onAddActivity(entry.id, "reply", { content, parentId });
    setSubmittingReply(false);
    refreshActivities();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      await onDelete(entry);
      onClose();
    }
  };
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-md p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-white/20 sm:rounded-3xl shadow-soft flex flex-col"
        onClick={(event) => event.stopPropagation()}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,.2),_transparent_70%)] p-3 sm:p-4">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/50">
              ENTRY
            </p>
            <h3 className="mt-1 text-base sm:text-lg font-semibold">
              {entry.user?.loveName || entry.user?.name || "User"}
            </h3>
            <p className="text-[10px] sm:text-xs text-white/50">
              {formatDate(entry.date)} · {entry.count}{" "}
              {entry.count === 1 ? "person" : "people"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <img src={ANT_LOGO} alt="Ant Design" className="ant-logo hidden h-7 w-7 rounded-full border border-white/20 bg-white/80 p-1 sm:block" />
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 p-1.5 sm:p-2 hover:bg-white/10 transition-colors"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {displayNames.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="min-w-[56px] text-center">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50">
                    Count
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold leading-none text-white">
                    {entry.count}
                  </p>
                </div>

                <div className="flex-1 border-l border-white/10 pl-3 sm:pl-4">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50 mb-1.5">
                    Names
                  </p>
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed break-words">
                    {displayNames.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {entry.note && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-white/80 whitespace-pre-wrap">
                {entry.note}
              </p>
            </div>
          )}

          {images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/50">
                <Image className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>Photos</span>
              </div>
              {images.length === 1 ? (
                <div className="flex justify-center">
                  <button
                    onClick={() => onImageClick(images[0])}
                    className="overflow-hidden rounded-xl border border-white/10 bg-black/10 max-w-full"
                  >
                    <img
                      src={images[0]}
                      alt="Entry"
                      className="max-h-48 sm:max-h-64 w-auto max-w-full object-contain"
                    />
                  </button>
                </div>
              ) : (
                <Swiper
                  modules={[FreeMode, Scrollbar]}
                  spaceBetween={8}
                  slidesPerView="auto"
                  freeMode={true}
                  scrollbar={{ draggable: true, hide: false }}
                  className="!pb-2"
                >
                  {images.map((url, index) => (
                    <SwiperSlide
                      key={index}
                      style={{ width: "150px", maxWidth: "40vw" }}
                    >
                      <button
                        onClick={() => onImageClick(url)}
                        className="block w-full h-24 sm:h-32 rounded-xl overflow-hidden border border-white/10 bg-black/10"
                      >
                        <img
                          src={url}
                          alt={`Entry ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50">
              Reactions
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {primaryReactions.map((kind) => (
                  <ReactionButton
                    key={kind}
                    kind={kind}
                    emoji={reactionConfig[kind].emoji}
                    label={reactionConfig[kind].label}
                    count={entryReactionCounts[kind]}
                    isActive={entryReaction === kind}
                    onClick={() => handleEntryReaction(kind)}
                  />
                ))}

                <div className="relative" ref={moreReactionsRef}>
                  <button
                    onClick={() => setShowMoreReactions(!showMoreReactions)}
                    className="flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-1.5 sm:p-2 hover:bg-white/10 transition-colors"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>

                  <AnimatePresence>
                    {showMoreReactions && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 bottom-full mb-2 z-20 grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-ink/95 p-2 shadow-xl backdrop-blur-md"
                        style={{ minWidth: "220px" }}
                      >
                        {extraReactionPicker.map(({ kind, emoji }, index) => (
                          <button
                            key={`${kind}-${emoji}-${index}`}
                            onClick={() => {
                              handleEntryReaction(kind);
                              setShowMoreReactions(false);
                            }}
                            className={`rounded-lg p-1.5 text-base transition-colors hover:bg-white/10 ${
                              entryReaction === kind
                                ? "bg-fuchsia-500/20 ring-1 ring-fuchsia-400/60"
                                : ""
                            }`}
                            title={reactionConfig[kind].label}
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-white/50">
              Discussion (
              {
                comments.filter(
                  (c) => c.type === "comment" || c.type === "reply",
                ).length
              }
              )
            </p>

            <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-1">
              {commentTree.map((comment) => (
                <ReplyThread
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  activeUserId={activeUserId}
                  isJudge={isJudge}
                  onReply={handleAddReply}
                  onAddReaction={handleAddReaction}
                  reactionMap={reactionMap}
                  setReactionMap={setReactionMap}
                  replyInput={replyInput}
                  setReplyInput={setReplyInput}
                  replyTarget={replyTarget}
                  setReplyTarget={setReplyTarget}
                  submittingReply={submittingReply}
                  allActivities={[...comments, ...reactions]}
                />
              ))}

              {commentTree.length === 0 && (
                <p className="text-xs sm:text-sm text-white/40 text-center py-4">
                  No comments yet. Start the conversation!
                </p>
              )}
            </div>

            {!isJudge && (
              <div className="flex gap-2 pt-2">
                <input
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs sm:text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentInput.trim()}
                  className="rounded-lg border border-white/15 px-3 sm:px-4 py-2 text-xs sm:text-sm disabled:opacity-40 hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  Post
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 p-3 sm:p-4">
          <button
            onClick={() => onEdit(entry)}
            disabled={entry.userId !== activeUserId || isJudge}
            className="rounded-xl border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs disabled:opacity-40 hover:bg-white/10 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={entry.userId !== activeUserId || isJudge}
            className="rounded-xl border border-white/10 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-red-300 disabled:opacity-40 hover:bg-white/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
