import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, IconButton, PressableScale } from '../../src/components/ui';
import { showToast } from '../../src/stores/toastStore';
import { useProviderStore, PRO_DAYS, PRO_SLOTS } from '../../src/stores/providerStore';
import { useColors, radius, spacing, type Palette } from '../../src/theme';

export default function ProAvailability() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const availability = useProviderStore((s) => s.availability);
  const toggleSlot = useProviderStore((s) => s.toggleSlot);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.back}
        />
        <Text variant="title2" style={styles.title}>
          Availability
        </Text>
        <PressableScale
          onPress={() => showToast('Availability saved')}
          haptic="selection"
          accessibilityRole="button"
          accessibilityLabel="Save"
        >
          <Text variant="footnote" tone="accent">
            Save
          </Text>
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="caption" tone="muted" style={styles.intro}>
          Tap time slots to toggle when you’re available each day.
        </Text>
        {PRO_DAYS.map((day) => {
          const slots = availability[day] ?? [];
          return (
            <View key={day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text variant="headline">{day}</Text>
                <Text variant="caption" tone="muted">
                  {slots.length === 0 ? 'Day off' : `${slots.length} slots`}
                </Text>
              </View>
              <View style={styles.slotWrap}>
                {PRO_SLOTS.map((slot) => {
                  const on = slots.includes(slot);
                  return (
                    <PressableScale
                      key={slot}
                      style={[styles.slot, on && styles.slotOn]}
                      onPress={() => toggleSlot(day, slot)}
                      haptic="selection"
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={`${day} ${slot} ${on ? 'available' : 'unavailable'}`}
                    >
                      <Text variant="footnote" tone={on ? 'accent' : 'muted'}>
                        {slot}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { marginLeft: -spacing.xs },
    title: { flex: 1 },
    intro: { marginBottom: spacing.lg },
    dayCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      marginBottom: spacing.md,
    },
    dayHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    slotWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    slot: {
      minWidth: 68,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      alignItems: 'center',
    },
    slotOn: { borderColor: c.brand.primary, backgroundColor: c.brand.primarySoft },
  });
