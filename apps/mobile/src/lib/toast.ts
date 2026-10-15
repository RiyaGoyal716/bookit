import { useToastQueueStore } from '../stores/toastQueueStore';
import { haptics } from './haptics';

/** Imperative NOVA toast helpers backed by the stacked toast queue. */
export const toast = {
  show: (message: string) => useToastQueueStore.getState().push({ message }),
  success: (message: string) => {
    haptics.success();
    return useToastQueueStore.getState().push({ message, tone: 'success' });
  },
  /** Destructive action with an Undo. Fires an error haptic. */
  undo: (message: string, onUndo: () => void) => {
    haptics.warning();
    return useToastQueueStore
      .getState()
      .push({ message, actionLabel: 'Undo', onAction: onUndo, tone: 'danger', duration: 5000 });
  },
};
