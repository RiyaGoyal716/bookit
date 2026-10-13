import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { Button, Chip, Input } from '../src/components';
import { showToast } from '../src/stores/toastStore';
import { useAuthStore } from '../src/stores/authStore';
import { useReviewsStore } from '../src/stores/reviewsStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';
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
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Rate your experience</Text>
        {providerName ? <Text style={styles.subtitle}>How was {providerName}?</Text> : null}

        <View style={styles.stars}>
          {STARS.map((s) => (
            <Pressable
              key={s}
              onPress={() => {
                setRating(s);
                Haptics.selectionAsync().catch(() => {});
              }}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`${s} star${s > 1 ? 's' : ''}`}
              accessibilityState={{ selected: rating >= s }}
            >
              <Ionicons
                name={rating >= s ? 'star' : 'star-outline'}
                size={40}
                color={c.brand.star}
              />
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>What stood out?</Text>
        <View style={styles.tagWrap}>
          {TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              active={tags.includes(tag)}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </View>

        <Text style={styles.label}>Your review (optional)</Text>
        <Input
          value={text}
          onChangeText={setText}
          placeholder="Tell others what the service was like…"
          multiline
          maxLength={400}
        />

        <Text style={styles.label}>Add a photo (optional)</Text>
        {photo ? (
          <View style={styles.photoWrap}>
            <Image
              source={{ uri: photo }}
              style={styles.photo}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <Pressable
              style={styles.photoRemove}
              onPress={() => setPhoto(null)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
            >
              <Ionicons name="close" size={16} color={c.text.inverse} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.photoAdd}
            onPress={pickPhoto}
            accessibilityRole="button"
            accessibilityLabel="Add a photo"
          >
            <Ionicons name="camera-outline" size={22} color={c.brand.tint} />
            <Text style={styles.photoAddText}>Add a photo</Text>
          </Pressable>
        )}

        <Text style={styles.label}>Say thanks with a tip</Text>
        <View style={styles.tipRow}>
          {TIPS.map((v) => {
            const active = tip === v;
            return (
              <Pressable
                key={v}
                style={[styles.tipChip, active && styles.tipChipActive]}
                onPress={() => setTip(v)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={v === 0 ? 'No tip' : `Tip ${money(v)}`}
              >
                <Text style={[styles.tipText, active && styles.tipTextActive]}>
                  {v === 0 ? 'No tip' : money(v)}
                </Text>
              </Pressable>
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
    title: { ...typography.scale.h1, color: c.text.primary },
    subtitle: { ...typography.scale.body, color: c.text.secondary, marginTop: spacing.xs },
    stars: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'center',
      marginVertical: spacing.xl,
    },
    label: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
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
    photoAddText: { ...typography.scale.smallMedium, color: c.brand.tint },
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
    tipText: { ...typography.scale.smallMedium, color: c.text.secondary },
    tipTextActive: { color: c.text.inverse },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
  });
