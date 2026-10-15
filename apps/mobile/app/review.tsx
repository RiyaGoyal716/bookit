import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import {
  Button,
  Chip,
  TextField,
  Text,
  Icon,
  PressableScale,
  IconButton,
} from '../src/components/ui';
import { showToast } from '../src/stores/toastStore';
import { useAuthStore } from '../src/stores/authStore';
import { useReviewsStore } from '../src/stores/reviewsStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';
import { useMoney } from '../src/i18n';

const STARS = [1, 2, 3, 4, 5];
const TAGS = ['Punctual', 'Professional', 'Great value', 'Friendly', 'Thorough', 'Would rebook'];
const TIPS = [0, 2, 5, 10];

export default function WriteReviewScreen() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { providerId, providerName } = useLocalSearchParams<{
    providerId?: string;
    providerName?: string;
  }>();
  const addReview = useReviewsStore((s) => s.addReview);
  const userName = useAuthStore((s) => s.user?.name);

  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [tip, setTip] = useState(0);

  const canSubmit = rating > 0 && Boolean(providerId);

  const toggleTag = (tag: string) => {
    Haptics.selectionAsync().catch(() => {});
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    }).catch(() => null);
    if (res && !res.canceled && res.assets[0]) setPhoto(res.assets[0].uri);
  };

  const submit = () => {
    if (!canSubmit || !providerId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    addReview({
      providerId,
      author: userName ? `${userName} (you)` : 'You',
      rating,
      text: text.trim() || 'Great service.',
      tags: tags.length ? tags : undefined,
      photo: photo ?? undefined,
    });
    showToast(
      tip > 0
        ? `Thanks — review posted and ${money(tip)} tip sent`
        : 'Thanks — your review was posted',
    );
    router.back();
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          size={24}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.back}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="title1">Rate your experience</Text>
        {providerName ? (
          <Text variant="body" tone="muted" style={styles.subtitle}>
            How was {providerName}?
          </Text>
        ) : null}

        <View style={styles.stars}>
          {STARS.map((s) => (
            <PressableScale
              key={s}
              haptic={null}
              onPress={() => {
                setRating(s);
                Haptics.selectionAsync().catch(() => {});
              }}
              accessibilityRole="button"
              accessibilityLabel={`${s} star${s > 1 ? 's' : ''}`}
              accessibilityState={{ selected: rating >= s }}
            >
              <Icon name="star" size={24} color={rating >= s ? c.brand.star : c.text.muted} />
            </PressableScale>
          ))}
        </View>

        <Text variant="footnote" tone="muted" style={styles.label}>
          What stood out?
        </Text>
        <View style={styles.tagWrap}>
          {TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={tags.includes(tag)}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </View>

        <View style={styles.label}>
          <TextField
            label="Your review (optional)"
            value={text}
            onChangeText={setText}
            placeholder="Tell others what the service was like…"
            multiline
            maxLength={400}
          />
        </View>

        <Text variant="footnote" tone="muted" style={styles.label}>
          Add a photo (optional)
        </Text>
        {photo ? (
          <View style={styles.photoWrap}>
            <Image
              source={{ uri: photo }}
              style={styles.photo}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <PressableScale
              style={styles.photoRemove}
              onPress={() => setPhoto(null)}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
            >
              <Icon name="close" size={16} color={c.text.inverse} />
            </PressableScale>
          </View>
        ) : (
          <PressableScale
            style={styles.photoAdd}
            onPress={pickPhoto}
            accessibilityRole="button"
            accessibilityLabel="Add a photo"
          >
            <Icon name="camera" size={24} color={c.brand.tint} />
            <Text variant="footnote" tone="accent">
              Add a photo
            </Text>
          </PressableScale>
        )}

        <Text variant="footnote" tone="muted" style={styles.label}>
          Say thanks with a tip
        </Text>
        <View style={styles.tipRow}>
          {TIPS.map((v) => {
            const active = tip === v;
            return (
              <PressableScale
                key={v}
                style={[styles.tipChip, active && styles.tipChipActive]}
                onPress={() => setTip(v)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={v === 0 ? 'No tip' : `Tip ${money(v)}`}
              >
                <Text variant="footnote" tone={active ? 'inverse' : 'muted'}>
                  {v === 0 ? 'No tip' : money(v)}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button label="Post review" disabled={!canSubmit} onPress={submit} />
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
    back: { alignSelf: 'flex-start' },
    subtitle: { marginTop: spacing.xs },
    stars: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'center',
      marginVertical: spacing.xl,
    },
    label: {
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    photoAdd: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.brand.primary,
    },
    photoWrap: { width: 120, height: 120 },
    photo: { width: 120, height: 120, borderRadius: radius.md, backgroundColor: c.skeleton },
    photoRemove: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: c.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    tipChip: {
      minHeight: 44,
      minWidth: 64,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    tipChipActive: { backgroundColor: c.brand.primary, borderColor: c.brand.primary },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
  });
