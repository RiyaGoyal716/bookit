import { create } from 'zustand';

export interface ToastItem {
  id: number;
  message: string;
  /** Optional action (e.g. "Undo"). */
  actionLabel?: string;
  onAction?: () => void;
  /** Auto-dismiss after this many ms. 0 = sticky. */
  duration: number;
  tone: 'default' | 'success' | 'danger';
}

export interface ToastQueueState {
  toasts: ToastItem[];
  /** Newest-first cap on the visible stack. */
  max: number;
  push: (
    t: Omit<ToastItem, 'id' | 'duration' | 'tone'> & Partial<Pick<ToastItem, 'duration' | 'tone'>>,
  ) => number;
  dismiss: (id: number) => void;
  /** Run a toast's action (e.g. Undo) then dismiss it. */
  runAction: (id: number) => void;
  clear: () => void;
}

let nextId = 1;

/**
 * Stacked toast queue (session-only). Supports Undo actions and a capped
 * newest-first stack. UI (ToastHost) renders and auto-dismisses by `duration`.
 */
export const useToastQueueStore = create<ToastQueueState>((set, get) => ({
  toasts: [],
  max: 3,
  push: (t) => {
    const id = nextId++;
    const item: ToastItem = {
      id,
      message: t.message,
      actionLabel: t.actionLabel,
      onAction: t.onAction,
      duration: t.duration ?? 4000,
      tone: t.tone ?? 'default',
    };
    set((s) => ({ toasts: [item, ...s.toasts].slice(0, s.max) }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  runAction: (id) => {
    const item = get().toasts.find((x) => x.id === id);
    item?.onAction?.();
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
  },
  clear: () => set({ toasts: [] }),
}));
