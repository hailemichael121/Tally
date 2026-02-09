import { motion } from "framer-motion";
import { Entry } from "../types";
import { useToast } from "../contexts/ToastContext";

interface EntryModalProps {
  entry: Entry;
  activeUserId: string;
  isJudge: boolean;
  onClose: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  onImageClick: (url: string) => void;
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
}: EntryModalProps) {
  const { addToast } = useToast();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      await onDelete(entry);
    }
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
              {entry.user.loveName}
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

          {!hasDetails(entry) && (
            <p className="py-4 text-center text-xs text-white/50">
              No extra details
            </p>
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
