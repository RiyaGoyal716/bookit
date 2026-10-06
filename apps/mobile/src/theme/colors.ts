/**
 * Colour tokens for the Bookit app.
 * Plain TypeScript objects — no business logic.
 */
export const colors = {
  brand: {
    primary: '#208AEF',
    primaryDark: '#1667B8',
    accent: '#00C2A8',
  },
  text: {
    primary: '#11181C',
    secondary: '#49636E',
    inverse: '#FFFFFF',
  },
  background: {
    base: '#FFFFFF',
    muted: '#F2F5F7',
    elevated: '#E6F4FE',
  },
  border: '#D5DEE3',
  status: {
    success: '#2E9E5B',
    warning: '#E0A106',
    error: '#D1434B',
  },
} as const;

export type Colors = typeof colors;
