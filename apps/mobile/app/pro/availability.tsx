import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { showToast } from '../../src/stores/toastStore';
import { useProviderStore, PRO_DAYS, PRO_SLOTS } from '../../src/stores/providerStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

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
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Availability</Text>
        <Pressable
          onPress={() => showToast('Availability saved')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Save"
        >
          <Text style={styles.save}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>Tap time slots to toggle when you’re available each day.</Text>
        {PRO_DAYS.map((day) => {
          const slots = availability[day] ?? [];
          return (
            <View key={day} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day}</Text>
                <Text style={styles.dayCount}>
                  {slots.length === 0 ? 'Day off' : `${slots.length} slots`}
                </Text>
              </View>
              <View style={styles.slotWrap}>
                {PRO_SLOTS.map((slot) => {
                  const on = slots.includes(slot);
                  return (
                    <Pressable
                      key={slot}
                      style={[styles.slot, on && styles.slotOn]}
                      onPress={() => toggleSlot(day, slot)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={`${day} ${slot} ${on ? 'available' : 'unavailable'}`}
                    >
                      <Text style={[styles.slotText, on && styles.slotTextOn]}>{slot}</Text>
                    </Pressable>
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
    title: { flex: 1, ...typography.scale.h2, color: c.text.primary },
    save: { ...typography.scale.smallMedium, color: c.brand.tint },
    intro: { ...typography.scale.small, color: c.text.secondary, marginBottom: spacing.lg },
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
    dayName: { ...typography.scale.bodyMedium, color: c.text.primary },
    dayCount: { ...typography.scale.caption, color: c.text.muted },
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
    slotText: { ...typography.scale.smallMedium, color: c.text.secondary },
    slotTextOn: { color: c.brand.tint },
  });
