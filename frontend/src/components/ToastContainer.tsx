import { AnimatePresence } from "framer-motion";
import ToastItem, { Toast } from "./Toast";

interface ToastContainerProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
}

export default function ToastContainer({
  toasts,
  onRemoveToast,
}: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemoveToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
