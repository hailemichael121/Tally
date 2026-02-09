import { motion } from "framer-motion";
import { User } from "../types";

interface EntryFormProps {
  formState: {
    id: string;
    count: string;
    tags: string;
    note: string;
    date: string;
    imageFile: File | null;
  };
  setFormState: (state: any) => void;
  imagePreviewUrl: string | null;
  activeUser: User | null;
  isSubmitting: boolean;
  isJudge: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EntryForm({
  formState,
  setFormState,
  imagePreviewUrl,
  activeUser,
  isSubmitting,
  isJudge,
  onClose,
  onSave,
}: EntryFormProps) {
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
        <div className="flex items-start justify-between    border border-white/10 rounded-2xl px-4 py-3   w-full bg-ink backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {formState.id ? "Edit Entry" : "New Entry"}
            </p>
            <h3 className="mt-2 text-lg font-semibold">
              {activeUser?.loveName ?? "Select user"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-2 text-xs transition-colors hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-xs text-white/60">Count</label>
            <input
              className="soft-input w-full"
              type="number"
              placeholder="በይ ቁጥር ተናገሪ"
              min={1}
              value={formState.count}
              onChange={(event) =>
                setFormState((prev: any) => ({
                  ...prev,
                  count: event.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-xs text-white/60">
              Name (optional)
            </label>
            <input
              className="soft-input w-full"
              placeholder="Add names if you got"
              value={formState.tags}
              onChange={(event) =>
                setFormState((prev: any) => ({
                  ...prev,
                  tags: event.target.value,
                }))
              }
            />
            <p className="mt-2 text-[11px] text-white/40">Not essential.</p>
          </div>

          <div>
            <label className="mb-2 block text-xs text-white/60">Note</label>
            <textarea
              className="soft-input w-full"
              rows={3}
              placeholder="እሺ ማስተባበያ አለሽ "
              value={formState.note}
              onChange={(event) =>
                setFormState((prev: any) => ({
                  ...prev,
                  note: event.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-xs text-white/60">
              Image(screenshots ቅብርጥሴ)
            </label>
            <input
              className="soft-input w-full"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setFormState((prev: any) => ({
                  ...prev,
                  imageFile: event.target.files?.[0] ?? null,
                }))
              }
            />
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="preview"
                className="mt-3 h-36 w-full rounded-2xl border border-white/10 object-cover"
              />
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs text-white/60">Date</label>
            <input
              className="soft-input w-full"
              type="date"
              value={formState.date}
              onChange={(event) =>
                setFormState((prev: any) => ({
                  ...prev,
                  date: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="mt-8 pb-4">
          <button
            onClick={onSave}
            disabled={
              isSubmitting || !formState.count || !activeUser || isJudge
            }
            className="w-full rounded-2xl bg-cocoa px-6 py-3 text-sm font-semibold text-mist transition-colors hover:bg-cocoa/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting
              ? "Saving..."
              : formState.id
                ? "Update Entry"
                : "Save Entry"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
