import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import React from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export default function ToastItem({ toast, onRemove }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <XCircle className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />,
  };

  const colors = {
    success: "bg-green-500/20 border-green-500/40 text-green-300",
    error: "bg-red-500/20 border-red-500/40 text-red-300",
    warning: "bg-amber-500/20 border-amber-500/40 text-amber-300",
    info: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`rounded-2xl border p-4 shadow-lg backdrop-blur-xl ${colors[toast.type]}`}
    >
      <div className="flex items-center gap-3">
        <span>{icons[toast.type]}</span>
        <span className="text-sm font-medium">{toast.message}</span>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-auto text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
