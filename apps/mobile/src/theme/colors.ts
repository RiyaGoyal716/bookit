/**
 * Colour tokens for the Bookit app.
 * Plain TypeScript objects — no business logic.
 */
export const colors = {
  brand: {
    /** Single primary brand colour — a strong indigo used across the app. */
    primary: '#4F46E5',
    primaryDark: '#4338CA',
    primarySoft: '#EEF0FE',
    accent: '#00C2A8',
    star: '#F5A623',
  },
  text: {
    primary: '#11181C',
    secondary: '#5A6B74',
    muted: '#8A98A0',
    inverse: '#FFFFFF',
  },
  background: {
    base: '#FFFFFF',
    muted: '#F4F6F8',
    elevated: '#EEF0FE',
  },
  border: '#E3E8EC',
  skeleton: '#E7ECEF',
  status: {
    // Requested = amber, Accepted = blue, Completed = green.
    success: '#1E9E5A',
    successSoft: '#E4F6EC',
    info: '#2563EB',
    infoSoft: '#E4EDFE',
    warning: '#D98A00',
    warningSoft: '#FDF1DC',
    error: '#D1434B',
  },
  overlay: 'rgba(17,24,28,0.04)',
} as const;

export type Colors = typeof colors;
