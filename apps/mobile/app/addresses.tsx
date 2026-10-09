import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, Input } from '../src/components';
import { showToast } from '../src/stores/toastStore';
import { useAddressStore, type Address } from '../src/stores/addressStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

export default function AddressesScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const addresses = useAddressStore((s) => s.addresses);
  const add = useAddressStore((s) => s.add);
  const remove = useAddressStore((s) => s.remove);

  const [label, setLabel] = useState('');
  const [line, setLine] = useState('');

  const canSave = label.trim().length > 0 && line.trim().length >= 4;

  const save = () => {
    if (!canSave) return;
    add({ label: label.trim(), line: line.trim() });
    setLabel('');
    setLine('');
    showToast('Address saved');
  };

  const iconFor = (a: Address): keyof typeof Ionicons.glyphMap => {
    if (a.fromLocation) return 'navigate';
    if (a.label.toLowerCase() === 'work') return 'briefcase';
    return 'home';
  };

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
        <Text style={styles.headerTitle}>Saved addresses</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.list}>
          {addresses.map((a) => (
            <View key={a.id} style={styles.addressRow}>
              <View style={styles.addressIcon}>
                <Ionicons name={iconFor(a)} size={18} color={c.brand.tint} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>{a.label}</Text>
                <Text style={styles.addressLine} numberOfLines={2}>
                  {a.line}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  remove(a.id);
                  showToast('Address removed');
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${a.label}`}
              >
                <Ionicons name="trash-outline" size={20} color={c.text.muted} />
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Add a new address</Text>
        <View style={styles.form}>
          <Input
            label="Label"
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Mum's house"
          />
          <Input
            label="Address"
            value={line}
            onChangeText={setLine}
            placeholder="e.g. 5 Otley Road, Headingley, LS6 3AA"
            multiline
          />
          <Button label="Save address" icon="add" disabled={!canSave} onPress={save} />
        </View>
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
    headerTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
    },
    content: {
      paddingHorizontal: spacing.lg,
    },
    list: {
      gap: spacing.sm,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    addressIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addressInfo: { flex: 1, gap: 2 },
    addressLabel: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    addressLine: {
      ...typography.scale.small,
      color: c.text.secondary,
    },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    form: {
      gap: spacing.lg,
    },
  });
