import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

import { useColors, radius, spacing, typography, type Palette } from '../theme';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Chip } from './Chip';

export type SortKey = 'rating' | 'price' | 'distance';
export type PriceRange = 'any' | 'low' | 'mid' | 'high';

export interface SortFilterValue {
  sort: SortKey;
  priceRange: PriceRange;
  minRating4: boolean;
  availableToday: boolean;
}

export const DEFAULT_SORT_FILTER: SortFilterValue = {
  sort: 'rating',
  priceRange: 'any',
  minRating4: false,
  availableToday: false,
};

/** Count of non-default filters applied (used for a badge). */
export function activeFilterCount(value: SortFilterValue): number {
  let n = 0;
  if (value.priceRange !== 'any') n += 1;
  if (value.minRating4) n += 1;
  if (value.availableToday) n += 1;
  return n;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Top rated' },
  { key: 'price', label: 'Lowest price' },
  { key: 'distance', label: 'Nearest' },
];

const PRICES: { key: PriceRange; label: string }[] = [
  { key: 'any', label: 'Any' },
  { key: 'low', label: 'Up to £25' },
  { key: 'mid', label: '£25–50' },
  { key: 'high', label: '£50+' },
];

export interface SortFilterSheetProps {
  visible: boolean;
  value: SortFilterValue;
  onClose: () => void;
  onApply: (value: SortFilterValue) => void;
}

/** Bottom sheet for sorting and filtering the provider list. */
export function SortFilterSheet({ visible, value, onClose, onApply }: SortFilterSheetProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [draft, setDraft] = useState<SortFilterValue>(value);

  // Re-sync the draft whenever the sheet is (re)opened.
  const [wasVisible, setWasVisible] = useState(false);
  if (visible && !wasVisible) {
    setWasVisible(true);
    setDraft(value);
  }
  if (!visible && wasVisible) setWasVisible(false);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Sort & filter">
      <Text style={styles.label}>Sort by</Text>
      <View style={styles.row}>
        {SORTS.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            active={draft.sort === s.key}
            onPress={() => setDraft((d) => ({ ...d, sort: s.key }))}
          />
        ))}
      </View>

      <Text style={styles.label}>Price</Text>
      <View style={styles.row}>
        {PRICES.map((p) => (
          <Chip
            key={p.key}
            label={p.label}
            active={draft.priceRange === p.key}
            onPress={() => setDraft((d) => ({ ...d, priceRange: p.key }))}
          />
        ))}
      </View>

      <Text style={styles.label}>Filters</Text>
      <ToggleRow
        label="Rating 4.0 and up"
        value={draft.minRating4}
        onToggle={() => setDraft((d) => ({ ...d, minRating4: !d.minRating4 }))}
        styles={styles}
        c={c}
      />
      <ToggleRow
        label="Available today"
        value={draft.availableToday}
        onToggle={() => setDraft((d) => ({ ...d, availableToday: !d.availableToday }))}
        styles={styles}
        c={c}
      />

      <View style={styles.actions}>
        <Button
          label="Reset"
          variant="secondary"
          onPress={() => setDraft(DEFAULT_SORT_FILTER)}
          style={styles.resetBtn}
        />
        <Button label="Show results" onPress={() => onApply(draft)} style={styles.applyBtn} />
      </View>
    </BottomSheet>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
  styles,
  c,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <Pressable
      style={styles.toggleRow}
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
    >
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.switch, value && { backgroundColor: c.brand.primary }]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    label: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 48,
    },
    toggleLabel: {
      ...typography.scale.body,
      color: c.text.primary,
    },
    switch: {
      width: 48,
      height: 28,
      borderRadius: radius.pill,
      backgroundColor: c.background.muted,
      padding: 3,
      justifyContent: 'center',
    },
    knob: {
      width: 22,
      height: 22,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
    },
    knobOn: {
      alignSelf: 'flex-end',
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.xl,
    },
    resetBtn: {
      flex: 1,
    },
    applyBtn: {
      flex: 2,
    },
  });
