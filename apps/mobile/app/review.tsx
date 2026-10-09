import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, Input, Screen } from '../src/components';
import { showToast } from '../src/stores/toastStore';
import { useAuthStore } from '../src/stores/authStore';
import { useReviewsStore } from '../src/stores/reviewsStore';
import { useColors, spacing, typography, type Palette } from '../src/theme';

const STARS = [1, 2, 3, 4, 5];

export default function WriteReviewScreen() {
  const router = useRouter();
  const c = useColors();
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

  const canSubmit = rating > 0 && providerId;

  const submit = () => {
    if (!canSubmit || !providerId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    addReview({
      providerId,
      author: userName ? `${userName} (you)` : 'You',
      rating,
      text: text.trim() || 'Great service.',
    });
    showToast('Thanks — your review was posted');
    router.back();
  };

  return (
    <Screen keyboardAvoiding>
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : spacing.sm }]}>
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

      <View style={styles.flex}>
        <Text style={styles.title}>Write a review</Text>
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

        <Input
          label="Your review (optional)"
          value={text}
          onChangeText={setText}
          placeholder="Tell others what the service was like…"
          multiline
          maxLength={400}
        />
      </View>

      <View style={styles.footer}>
        <Button label="Post review" disabled={!canSubmit} onPress={submit} />
      </View>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    header: {},
    flex: { flex: 1 },
    back: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
    title: {
      ...typography.scale.h1,
      color: c.text.primary,
    },
    subtitle: {
      ...typography.scale.body,
      color: c.text.secondary,
      marginTop: spacing.sm,
    },
    stars: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'center',
      marginVertical: spacing.xl,
    },
    footer: {
      paddingTop: spacing.md,
    },
  });
