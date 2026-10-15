import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Icon,
  PressableScale,
  ScreenHeader,
  Text,
  TextField,
  type IconName,
} from '../src/components/ui';
import { showToast } from '../src/stores/toastStore';
import { useAddressStore, type Address } from '../src/stores/addressStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

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
  const [instructions, setInstructions] = useState('');

  const canSave = label.trim().length > 0 && line.trim().length >= 4;

  const save = () => {
    if (!canSave) return;
    add({ label: label.trim(), line: line.trim(), instructions: instructions.trim() || undefined });
    setLabel('');
    setLine('');
    setInstructions('');
    showToast('Address saved');
  };

  const iconFor = (a: Address): IconName => {
    if (a.fromLocation) return 'navigation';
    if (a.label.toLowerCase() === 'work') return 'briefcase';
    return 'home';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ScreenHeader title="Saved addresses" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.list}>
          {addresses.map((a) => (
            <View key={a.id} style={styles.addressRow}>
              <View style={styles.addressIcon}>
                <Icon name={iconFor(a)} size={20} color={c.brand.tint} />
              </View>
              <View style={styles.addressInfo}>
                <Text variant="headline">{a.label}</Text>
                <Text variant="caption" tone="muted" numberOfLines={2}>
                  {a.line}
                </Text>
                {a.instructions ? (
                  <View style={styles.addressNoteRow}>
                    <Icon name="info" size={16} color={c.text.muted} />
                    <Text variant="caption" tone="subtle" numberOfLines={1} style={styles.flex1}>
                      {a.instructions}
                    </Text>
                  </View>
                ) : null}
              </View>
              <PressableScale
                onPress={() => {
                  remove(a.id);
                  showToast('Address removed');
                }}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${a.label}`}
              >
                <Icon name="trash" size={20} color={c.text.muted} />
              </PressableScale>
            </View>
          ))}
        </View>

        <Text variant="title2" style={styles.sectionTitle}>
          Add a new address
        </Text>
        <View style={styles.mapPlaceholder}>
          <Icon name="map-pin" size={24} color={c.brand.tint} />
          <Text variant="callout" tone="muted" center style={styles.mapCaption}>
            {line.trim() ? line.trim() : 'Drop a pin to set your address'}
          </Text>
        </View>
        <View style={styles.form}>
          <TextField
            label="Label"
            value={label}
            onChangeText={setLabel}
            placeholder="e.g. Mum's house"
          />
          <TextField
            label="Address"
            value={line}
            onChangeText={setLine}
            placeholder="e.g. 5 Otley Road, Headingley, LS6 3AA"
            multiline
          />
          <TextField
            label="Access instructions (optional)"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="e.g. buzzer 4, side gate code 1980"
            multiline
          />
          <Button label="Save address" icon="plus" disabled={!canSave} onPress={save} />
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    content: {
      paddingHorizontal: spacing.lg,
    },
    flex1: { flex: 1 },
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
    addressNoteRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    sectionTitle: {
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    mapPlaceholder: {
      height: 140,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.muted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    mapCaption: { marginTop: spacing.sm, paddingHorizontal: spacing.lg },
    form: {
      gap: spacing.lg,
    },
  });
