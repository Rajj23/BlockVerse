"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import clsx from "clsx";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  error:   <XCircle className="w-4 h-4 text-red-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  info:    <Info className="w-4 h-4 text-blue-500" />,
};

const borders = {
  success: "border-green-200 dark:border-green-800",
  error:   "border-red-200 dark:border-red-800",
  warning: "border-yellow-200 dark:border-yellow-800",
  info:    "border-blue-200 dark:border-blue-800",
};

export function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  useEffect(() => {
    const t = setTimeout(onRemove, 3500);
    return () => clearTimeout(t);
  }, [onRemove]);

  return (
    <div className={clsx(
      "flex items-start gap-3 px-4 py-3 rounded-xl border bg-white dark:bg-neutral-900 shadow-lg min-w-64 max-w-sm animate-fade-in",
      borders[toast.type]
    )}>
      <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
      <p className="text-sm text-neutral-800 dark:text-neutral-200 flex-1">{toast.message}</p>
      <button onClick={onRemove} className="shrink-0 p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
        <X className="w-3.5 h-3.5 text-neutral-400" />
      </button>
    </div>
  );
}