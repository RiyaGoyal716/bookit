import { useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Sparkles, Star } from 'lucide-react-native';

import { Screen } from '../src/components';
import { useT, useMoney, useDirectionalStyles } from '../src/i18n';
import { providers as allProviders } from '../src/mocks';
import type { Provider } from '../src/mocks/types';
import { route } from '../src/lib/nav';
import { useColors, radius, spacing, typography, shadow, type Palette } from '../src/theme';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  providers?: Provider[];
}

let counter = 0;
const nextId = () => `m${counter++}`;

/** Pick mock matches by keyword, falling back to top-rated. */
function matchProviders(query: string): Provider[] {
  const q = query.toLowerCase();
  const byCat = allProviders.filter((p) => q.includes(p.category));
  const pool = byCat.length > 0 ? byCat : [...allProviders].sort((a, b) => b.rating - a.rating);
  return pool.slice(0, 3);
}

export default function ConciergeScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const money = useMoney();
  const dir = useDirectionalStyles();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const listRef = useRef<FlatList<Message>>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: nextId(), role: 'bot', text: t('concierge.greeting') },
  ]);
  const [draft, setDraft] = useState('');

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const userMsg: Message = { id: nextId(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'bot',
          text: t('concierge.foundIntro'),
          providers: matchProviders(text),
        },
      ]);
      listRef.current?.scrollToEnd({ animated: true });
    }, 600);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={{ gap: spacing.sm }}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.user : styles.bot,
            { alignSelf: isUser ? 'flex-end' : 'flex-start' },
          ]}
        >
          <Text style={[styles.bubbleText, isUser && styles.userText]}>{item.text}</Text>
        </View>
        {item.providers?.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.card, dir.row]}
            onPress={() => router.push(`/provider/${p.id}`)}
            accessibilityRole="button"
            accessibilityLabel={p.name}
          >
            <Image
              source={{ uri: p.photo }}
              style={styles.cardPhoto}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View style={styles.flex}>
              <Text style={styles.cardName} numberOfLines={1}>
                {p.name}
              </Text>
              <View style={styles.cardMeta}>
                <Star size={12} color={c.brand.star} fill={c.brand.star} />
                <Text style={styles.cardRating}>{p.rating.toFixed(1)}</Text>
                <Text style={styles.cardDot}>·</Text>
                <Text style={styles.cardPrice}>{money(p.priceFrom)}</Text>
              </View>
            </View>
            <Pressable
              style={styles.bookBtn}
              onPress={() => router.push(route(`/booking/${p.id}`))}
              accessibilityRole="button"
              accessibilityLabel={t('common.bookThis')}
            >
              <Text style={styles.bookText}>{t('common.bookThis')}</Text>
            </Pressable>
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <Screen padded={false} keyboardAvoiding>
      <View style={[styles.header, dir.row]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ChevronLeft size={26} color={c.text.primary} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <View style={[styles.headerTitleRow, dir.row]}>
            <Sparkles size={16} color={c.brand.primary} />
            <Text style={styles.headerTitle}>{t('concierge.title')}</Text>
          </View>
          <Text style={styles.headerSub}>{t('concierge.subtitle')}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputBar, dir.row, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={t('concierge.placeholder')}
          placeholderTextColor={c.text.muted}
          style={[styles.input, dir.textAlign]}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable
          style={styles.sendBtn}
          onPress={send}
          accessibilityRole="button"
          accessibilityLabel={t('common.continue')}
        >
          <Send size={20} color={c.text.onBrand} />
        </Pressable>
      </View>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: {
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerTitleWrap: { flex: 1 },
    headerTitleRow: { alignItems: 'center', gap: spacing.xs },
    headerTitle: { ...typography.scale.h2, color: c.text.primary },
    headerSub: { ...typography.scale.caption, color: c.text.muted },
    headerSpacer: { width: 26 },
    list: { padding: spacing.lg },
    bubble: {
      maxWidth: '82%',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.xl,
    },
    bot: {
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderBottomLeftRadius: radius.sm,
    },
    user: { backgroundColor: c.brand.primary, borderBottomRightRadius: radius.sm },
    bubbleText: { ...typography.scale.body, color: c.text.primary },
    userText: { color: c.text.onBrand },
    card: {
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.background.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.sm,
      ...shadow.soft,
    },
    cardPhoto: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: c.skeleton },
    cardName: { ...typography.scale.smallMedium, color: c.text.primary },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    cardRating: { ...typography.scale.caption, color: c.text.primary },
    cardDot: { color: c.text.muted },
    cardPrice: { ...typography.scale.caption, color: c.brand.tint },
    bookBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
    },
    bookText: {
      ...typography.scale.caption,
      color: c.text.onBrand,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    inputBar: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.base,
    },
    input: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: c.background.muted,
      ...typography.scale.body,
      color: c.text.primary,
    },
    sendBtn: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
