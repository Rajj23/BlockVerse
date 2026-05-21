"use client";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

const colors = {
  success: "bg-green-500",
  error: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
};

export default function ToastContainer({ toasts, onRemove }: {
  toasts: Toast[];
  onRemove: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${colors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-64 cursor-pointer`}
          onClick={() => onRemove(toast.id)}
        >
          <span className="text-sm">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}