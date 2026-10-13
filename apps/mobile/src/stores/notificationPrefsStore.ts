import { create } from 'zustand';

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
  bookingUpdates: boolean;
  chatMessages: boolean;
  promotions: boolean;
  safetyAlerts: boolean;
}

interface NotificationPrefsState extends NotificationPrefs {
  toggle: (key: keyof NotificationPrefs) => void;
  set: (key: keyof NotificationPrefs, value: boolean) => void;
}

/** Notification preferences (session-only). Safety alerts default on and stay on. */
export const useNotificationPrefsStore = create<NotificationPrefsState>((set) => ({
  push: true,
  email: true,
  bookingUpdates: true,
  chatMessages: true,
  promotions: false,
  safetyAlerts: true,
  toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<NotificationPrefsState>),
  set: (key, value) => set({ [key]: value } as Partial<NotificationPrefsState>),
}));
