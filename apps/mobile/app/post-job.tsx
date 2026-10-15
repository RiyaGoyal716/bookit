import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { Button, Text, Icon, Chip, PressableScale } from '../src/components/ui';
import { useT, useMoney, useDirectionalStyles } from '../src/i18n';
import { showToast } from '../src/stores/toastStore';
import { route } from '../src/lib/nav';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const BUDGETS = [50, 100, 200, 400];
const DATES = ['Today', 'Tomorrow', 'This week', 'Flexible'];

export default function PostJobScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const money = useMoney();
  const dir = useDirectionalStyles();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [budget, setBudget] = useState<number | null>(null);
  const [dateIdx, setDateIdx] = useState(0);

  const addPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
        allowsMultipleSelection: true,
      });
      if (res.canceled) return;
      setPhotos((prev) => [...prev, ...res.assets.map((a) => a.uri)].slice(0, 6));
    } catch {
      showToast('Could not open your photos');
    }
  };

  const submit = () => {
    showToast(t('postJob.responsePromise'));
    router.replace(route('/offers'));
  };

  const canSubmit = title.trim().length > 2;

  return (
    <View style={styles.root}>
      <View style={[styles.header, dir.row, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Icon name="chevron-left" size={24} color={c.text.primary} />
        </PressableScale>
        <Text variant="title2">{t('postJob.title')}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Field label={t('postJob.jobTitle')} styles={styles} dir={dir}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('postJob.jobTitlePlaceholder')}
            placeholderTextColor={c.text.muted}
            style={[styles.input, dir.textAlign]}
          />
        </Field>

        <Field label={t('postJob.description')} styles={styles} dir={dir}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('postJob.descriptionPlaceholder')}
            placeholderTextColor={c.text.muted}
            style={[styles.input, styles.textArea, dir.textAlign]}
            multiline
          />
        </Field>

        <Field label={t('postJob.photos')} styles={styles} dir={dir}>
          <View style={[styles.photoRow, dir.row]}>
            {photos.map((uri, i) => (
              <View key={uri + i} style={styles.photoWrap}>
                <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                <PressableScale
                  style={styles.photoRemove}
                  onPress={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                >
                  <Icon name="close" size={16} color={c.text.onBrand} />
                </PressableScale>
              </View>
            ))}
            {photos.length < 6 ? (
              <PressableScale
                style={styles.addPhoto}
                onPress={addPhoto}
                accessibilityRole="button"
                accessibilityLabel={t('postJob.addPhoto')}
              >
                <Icon name="image" size={24} color={c.brand.primary} />
                <Text variant="micro" tone="accent">
                  {t('postJob.addPhoto')}
                </Text>
              </PressableScale>
            ) : null}
          </View>
        </Field>

        <Field label={t('postJob.budget')} styles={styles} dir={dir}>
          <View style={[styles.chips, dir.row]}>
            {BUDGETS.map((b) => (
              <Chip key={b} label={money(b)} selected={budget === b} onPress={() => setBudget(b)} />
            ))}
          </View>
        </Field>

        <Field label={t('postJob.date')} styles={styles} dir={dir}>
          <View style={[styles.chips, dir.row]}>
            {DATES.map((d, i) => (
              <Chip key={d} label={d} selected={dateIdx === i} onPress={() => setDateIdx(i)} />
            ))}
          </View>
        </Field>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text variant="caption" tone="muted" style={styles.promise}>
          {t('postJob.responsePromise')}
        </Text>
        <Button label={t('postJob.submit')} disabled={!canSubmit} onPress={submit} />
      </View>
    </View>
  );
}

function Field({
  label,
  styles,
  dir,
  children,
}: {
  label: string;
  styles: ReturnType<typeof makeStyles>;
  dir: ReturnType<typeof useDirectionalStyles>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text variant="footnote" tone="muted" style={[styles.label, dir.textAlign]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    header: {
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    body: { padding: spacing.lg, gap: spacing.xl },
    field: { gap: spacing.sm },
    label: { fontWeight: '600' },
    input: {
      minHeight: 52,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: c.background.surface,
      borderWidth: 1.5,
      borderColor: c.border,
      ...typography.scale.body,
      color: c.text.primary,
    },
    textArea: { minHeight: 110, textAlignVertical: 'top' },
    photoRow: { flexWrap: 'wrap', gap: spacing.sm },
    photoWrap: { width: 72, height: 72 },
    photo: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: c.skeleton },
    photoRemove: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: c.text.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addPhoto: {
      width: 72,
      height: 72,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    chips: { flexWrap: 'wrap', gap: spacing.sm },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      gap: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    promise: { textAlign: 'center' },
  });
