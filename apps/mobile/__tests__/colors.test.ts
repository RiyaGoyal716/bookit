import { lightTokens, darkTokens, type NovaTokens } from '../src/theme/colors';

/** Parse #RGB / #RRGGBB into [r,g,b] 0-255 (opaque tokens only). */
function parseHex(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two opaque colours. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const backgrounds: (keyof NovaTokens)[] = ['bg', 'bgSubtle', 'surface', 'surfaceRaised'];

describe.each([
  ['light', lightTokens],
  ['dark', darkTokens],
])('NOVA %s palette contrast', (_name, t) => {
  it('text and textMuted are >= 4.5:1 on every surface', () => {
    for (const bgKey of backgrounds) {
      const bg = t[bgKey];
      expect(contrast(t.text, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.textMuted, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('onPrimary is >= 4.5:1 on primary', () => {
    expect(contrast(t.onPrimary, t.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it('status colours meet the 3:1 graphical threshold on bg', () => {
    // Status colours are used as fills / icons / badges (graphical), not body text.
    for (const key of ['success', 'warning', 'danger', 'info'] as const) {
      expect(contrast(t[key], t.bg)).toBeGreaterThanOrEqual(3);
    }
  });

  it('textSubtle is reserved for incidental/placeholder text (WCAG-exempt)', () => {
    // Not an enforced text pair; just assert it is lighter than textMuted.
    expect(contrast(t.textSubtle, t.bg)).toBeLessThan(contrast(t.textMuted, t.bg));
  });

  it('white text is legible on the accent fill', () => {
    expect(contrast('#FFFFFF', t.accent)).toBeGreaterThanOrEqual(3);
  });
});
