import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { Text, type TextVariant } from './Text';
import { formatPrice } from './price';

export { formatPrice } from './price';

export interface PriceTagProps {
  /** Amount in minor units (pence). */
  minor: number;
  symbol?: string;
  fractionDigits?: number;
  variant?: TextVariant;
  /** Suffix like "/hr" or "/visit". */
  suffix?: string;
  /** Animate the number counting up to the value on change. */
  animate?: boolean;
  tone?: 'default' | 'accent' | 'muted';
}

/** Price with tabular figures and an optional count-up animation. */
export function PriceTag({
  minor,
  symbol = '£',
  fractionDigits = 2,
  variant = 'headline',
  suffix,
  animate = false,
  tone = 'default',
}: PriceTagProps) {
  const reduced = useReducedMotion();
  const [animated, setAnimated] = useState(minor);
  const from = useRef(minor);

  useEffect(() => {
    if (!animate || reduced) {
      from.current = minor;
      return;
    }
    const start = Date.now();
    const base = from.current;
    const dur = 320;
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(Math.round(base + (minor - base) * eased));
      if (p >= 1) {
        from.current = minor;
        clearInterval(id);
      }
    }, 16);
    return () => clearInterval(id);
  }, [minor, animate, reduced]);

  const display = animate && !reduced ? animated : minor;

  return (
    <Text variant={variant} tabular tone={tone} maxFontSizeMultiplier={1.3}>
      {formatPrice(display, { symbol, fractionDigits })}
      {suffix ? (
        <Text variant="caption" tone="muted">
          {suffix}
        </Text>
      ) : null}
    </Text>
  );
}
