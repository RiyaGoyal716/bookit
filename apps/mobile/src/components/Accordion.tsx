import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useColors, radius, spacing, typography, type Palette } from '../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface AccordionItem {
  question: string;
  answer: string;
}

export interface AccordionProps {
  items: AccordionItem[];
}

/** Expand/collapse FAQ accordion using core RN LayoutAnimation (no new deps). */
export function Accordion({ items }: AccordionProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => (prev === i ? null : i));
  };

  return (
    <View style={styles.wrap}>
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <View key={item.question} style={[styles.item, i < items.length - 1 && styles.divider]}>
            <Pressable
              style={styles.header}
              onPress={() => toggle(i)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={item.question}
            >
              <Text style={styles.question}>{item.question}</Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={c.text.muted}
              />
            </Pressable>
            {expanded ? <Text style={styles.answer}>{item.answer}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      overflow: 'hidden',
    },
    item: {
      paddingHorizontal: spacing.lg,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      minHeight: 56,
    },
    question: {
      flex: 1,
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    answer: {
      ...typography.scale.small,
      color: c.text.secondary,
      paddingBottom: spacing.lg,
    },
  });
