import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { EmptyState, Text, Icon, IconButton, PressableScale } from '../../src/components/ui';
import { showToast } from '../../src/stores/toastStore';
import { useChatStore, QUICK_REPLIES, type ChatMessage } from '../../src/stores/chatStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

export default function ChatScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { id } = useLocalSearchParams<{ id: string }>();

  const ensurePro = useChatStore((s) => s.ensurePro);
  const markRead = useChatStore((s) => s.markRead);
  const send = useChatStore((s) => s.send);
  const conversation = useChatStore((s) => s.conversations.find((conv) => conv.id === id));

  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (id && !conversation) ensurePro(id);
  }, [id, conversation, ensurePro]);

  useEffect(() => {
    if (id) markRead(id);
  }, [id, markRead]);

  const messageCount = conversation?.messages.length ?? 0;
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messageCount, typing]);

  if (!conversation) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          size={24}
          variant="subtle"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <EmptyState art="error" title="Conversation not found" />
      </View>
    );
  }

  const isSupport = conversation.kind === 'support';

  const doSend = (text?: string, image?: string) => {
    const body = (text ?? draft).trim();
    if (!body && !image) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    send(conversation.id, { text: body || undefined, image });
    setDraft('');
    if (isSupport) {
      setTyping(true);
      setTimeout(() => setTyping(false), 1500);
    }
  };

  const attachImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    }).catch(() => null);
    if (res && !res.canceled && res.assets[0]) doSend(undefined, res.assets[0].uri);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          size={24}
          variant="subtle"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        {isSupport ? (
          <View style={styles.supportAvatar}>
            <Icon name="sparkles" size={20} color={c.text.inverse} />
          </View>
        ) : conversation.avatar ? (
          <Image
            source={{ uri: conversation.avatar }}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : null}
        <View style={styles.flex1}>
          <Text variant="headline" numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text variant="caption" tone="accent">
            {typing ? 'typing…' : isSupport ? 'Bookit assistant' : 'Online'}
          </Text>
        </View>
        {!isSupport ? (
          <IconButton
            name="phone"
            size={24}
            color={c.brand.tint}
            onPress={() =>
              Linking.openURL('tel:+441130000000').catch(() => showToast('Calling unavailable'))
            }
            accessibilityLabel="Call"
          />
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {conversation.messages.map((m: ChatMessage) => (
          <Bubble key={m.id} message={m} styles={styles} />
        ))}
        {typing ? <TypingBubble styles={styles} /> : null}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRow}
        keyboardShouldPersistTaps="handled"
      >
        {QUICK_REPLIES.map((q) => (
          <PressableScale
            key={q}
            style={styles.quickChip}
            onPress={() => doSend(q)}
            haptic="selection"
            accessibilityRole="button"
            accessibilityLabel={`Send quick reply: ${q}`}
          >
            <Text variant="callout" tone="muted">
              {q}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <IconButton
          name="image"
          size={24}
          color={c.brand.tint}
          onPress={attachImage}
          accessibilityLabel="Attach a photo"
        />
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Message…"
          placeholderTextColor={c.text.muted}
          multiline
          accessibilityLabel="Message input"
        />
        <PressableScale
          style={[styles.sendBtn, !draft.trim() && styles.sendBtnOff]}
          onPress={() => doSend()}
          disabled={!draft.trim()}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Icon name="arrow-up" size={20} color={c.text.inverse} />
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({
  message,
  styles,
}: {
  message: ChatMessage;
  styles: ReturnType<typeof makeStyles>;
}) {
  const mine = message.from === 'me';
  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 220 }}
      style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowThem]}
    >
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleThem]}>
        {message.image ? (
          <Image
            source={{ uri: message.image }}
            style={styles.bubbleImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : null}
        {message.text ? (
          <Text variant="callout" tone={mine ? 'onPrimary' : 'default'}>
            {message.text}
          </Text>
        ) : null}
        <Text
          variant="micro"
          tone={mine ? 'onPrimary' : 'subtle'}
          style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}
        >
          {message.time}
        </Text>
      </View>
    </MotiView>
  );
}

function TypingBubble({ styles }: { styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={[styles.bubbleRow, styles.bubbleRowThem]}>
      <View style={[styles.bubble, styles.bubbleThem, styles.typing]}>
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ opacity: 0.3, translateY: 0 }}
            animate={{ opacity: 1, translateY: -3 }}
            transition={{ type: 'timing', duration: 400, loop: true, delay: i * 140 }}
            style={styles.typingDot}
          />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    flex1: { flex: 1 },
    avatar: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: c.skeleton },
    supportAvatar: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    messages: { padding: spacing.lg, gap: spacing.sm },
    bubbleRow: { flexDirection: 'row' },
    bubbleRowMine: { justifyContent: 'flex-end' },
    bubbleRowThem: { justifyContent: 'flex-start' },
    bubble: {
      maxWidth: '80%',
      padding: spacing.md,
      borderRadius: radius.lg,
      gap: spacing.xs,
    },
    bubbleMine: { backgroundColor: c.brand.primary, borderBottomRightRadius: radius.sm },
    bubbleThem: {
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderBottomLeftRadius: radius.sm,
    },
    bubbleImage: {
      width: 180,
      height: 135,
      borderRadius: radius.md,
      backgroundColor: c.skeleton,
    },
    bubbleTime: {
      alignSelf: 'flex-end',
    },
    bubbleTimeMine: { opacity: 0.75 },
    typing: { flexDirection: 'row', gap: 5, paddingVertical: spacing.md, alignItems: 'center' },
    typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.text.muted },
    quickRow: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    quickChip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 120,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      backgroundColor: c.background.muted,
      color: c.text.primary,
      ...typography.scale.body,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnOff: { opacity: 0.4 },
  });
