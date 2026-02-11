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
    imageUrl: string | null;
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      onSave();
    }
  };

  // Get the image URL to display (preview or existing)
  const displayImageUrl = imagePreviewUrl || formState.imageUrl;

  return (
    <motion.div
      className="theme-backdrop fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl p-4 shadow-soft sm:max-h-[88vh] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="theme-panel flex items-start justify-between rounded-2xl border border-white/10 px-3 py-3 backdrop-blur-sm sm:px-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              {formState.id ? "Edit Entry" : "New Entry"}
            </p>
            <h3 className="mt-2 text-lg font-semibold">
              {activeUser?.loveName ?? "Select user"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-2 text-xs transition-colors hover:bg-white/10"
            disabled={isSubmitting}
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-4 sm:mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs text-white/60">Count *</label>
              <input
                className="soft-input w-full text-sm"
                type="number"
                min={1}
                required
                value={formState.count}
                onChange={(event) =>
                  setFormState((prev: any) => ({
                    ...prev,
                    count: event.target.value,
                  }))
                }
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-white/60">Date *</label>
              <input
                className="soft-input w-full text-sm"
                type="date"
                required
                value={formState.date}
                onChange={(event) =>
                  setFormState((prev: any) => ({
                    ...prev,
                    date: event.target.value,
                  }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs text-white/60">
              Name (optional)
            </label>
            <input
              className="soft-input w-full text-sm"
              placeholder="Add names if you got"
              value={formState.tags}
              onChange={(event) =>
                setFormState((prev: any) => ({
                  ...prev,
                  tags: event.target.value,
                }))
              }
              disabled={isSubmitting}
            />
            <p className="mt-2 text-[11px] text-white/40">Not essential.</p>
          </div>

          <div>
            <label className="mb-2 block text-xs text-white/60">Note</label>
            <textarea
              className="soft-input w-full text-sm"
              rows={4}
              placeholder="eshi mastebabeya alesh ee kebatri for her • mastebabeya alek ee kebatra"
              value={formState.note}
              onChange={(event) =>
                setFormState((prev: any) => ({
                  ...prev,
                  note: event.target.value,
                }))
              }
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs text-white/60">Image</label>
            <input
              className="soft-input w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-white/15 file:px-3 file:py-2 file:text-xs file:font-medium file:text-inherit"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setFormState((prev: any) => ({
                  ...prev,
                  imageFile: event.target.files?.[0] ?? null,
                }))
              }
              disabled={isSubmitting}
            />

            {displayImageUrl && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-white/50">
                  {formState.imageFile ? "New image preview:" : "Current image:"}
                </p>
                <img
                  src={displayImageUrl}
                  alt="preview"
                  className="h-40 w-full rounded-2xl border border-white/10 object-cover sm:h-44"
                />
                {formState.id && formState.imageUrl && !formState.imageFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormState((prev: any) => ({
                        ...prev,
                        imageFile: null,
                        imageUrl: null, // Clear the stored URL when removing
                      }));
                    }}
                    className="mt-2 text-xs text-red-300 hover:text-red-400"
                  >
                    Remove image
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        <div className="mt-6 pb-2 sm:mt-8 sm:pb-4">
          <button
            type="submit"
            disabled={
              isSubmitting || !formState.count || !activeUser || isJudge
            }
            className="theme-btn-primary w-full rounded-2xl px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting
              ? "Saving..."
              : formState.id
                ? "Update Entry"
                : "Save Entry"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}