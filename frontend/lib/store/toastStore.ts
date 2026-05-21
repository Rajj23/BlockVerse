import { create } from "zustand";
import { ToastType, ToastMessage } from "@/components/ui/Toast";

interface ToastState {
  toasts: ToastMessage[];
  show: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
  },
  remove: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
}));