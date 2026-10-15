import { create } from 'zustand';

import { track } from '../lib/analytics';
import { getProviderById } from '../mocks';

export type MessageFrom = 'me' | 'them';

export interface ChatMessage {
  id: string;
  from: MessageFrom;
  text?: string;
  /** Local or remote image URI. */
  image?: string;
  /** Human-readable time, e.g. "14:32". */
  time: string;
}

export type ConversationKind = 'pro' | 'support';

export interface Conversation {
  id: string;
  kind: ConversationKind;
  name: string;
  avatar?: string;
  subtitle?: string;
  messages: ChatMessage[];
  unread: number;
  /** Sort key — higher is more recent. */
  order: number;
}

/** Quick-reply suggestions shown above the composer. */
export const QUICK_REPLIES = [
  'On my way',
  'Running 5 min late',
  'Thanks!',
  'Can we reschedule?',
  'What time works?',
];

/** Canned support-bot replies keyed by a matched keyword. */
function supportReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('refund') || t.includes('money'))
    return 'Refunds are processed to your original payment method within 3–5 days. Want me to open a refund request?';
  if (t.includes('cancel'))
    return 'You can cancel from the booking detail screen. Free up to 24h before — shall I take you there?';
  if (t.includes('pro') || t.includes('late') || t.includes('arriv'))
    return 'You can message or call your pro from the tracking screen, and watch their live ETA there.';
  return 'Thanks for reaching out! A Bookit specialist will follow up shortly. Meanwhile, is there anything else I can help with?';
}

function now(): string {
  const d = new Date();
  return `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`;
}

const seeded: Conversation[] = [
  {
    id: 'support',
    kind: 'support',
    name: 'Bookit Support',
    subtitle: 'We usually reply in a few minutes',
    unread: 0,
    order: 2,
    messages: [
      {
        id: 'm-s1',
        from: 'them',
        text: 'Hi! I’m the Bookit assistant. Ask me about bookings, refunds or payments.',
        time: '09:00',
      },
    ],
  },
  {
    id: 'p1',
    kind: 'pro',
    name: 'Hyde Park Home Cleaning',
    subtitle: 'Deep clean · Wed 8 Oct',
    unread: 1,
    order: 3,
    messages: [
      {
        id: 'm-1',
        from: 'them',
        text: 'Hi! Looking forward to the deep clean on Wednesday.',
        time: '08:40',
      },
      { id: 'm-2', from: 'me', text: 'Great — the key is under the mat.', time: '08:42' },
      { id: 'm-3', from: 'them', text: 'Perfect, see you at 9am', time: '08:43' },
    ],
  },
  {
    id: 'p5',
    kind: 'pro',
    name: 'Headingley Barber Co',
    subtitle: 'Cut & beard trim',
    unread: 0,
    order: 1,
    messages: [
      {
        id: 'm-4',
        from: 'them',
        text: 'Thanks for coming in! Hope you like the fade.',
        time: 'Mon',
      },
    ],
  },
];

interface ChatState {
  conversations: Conversation[];
  getById: (id: string) => Conversation | undefined;
  /** Create (if needed) and return a pro conversation for a provider id. */
  ensurePro: (providerId: string) => void;
  send: (id: string, input: { text?: string; image?: string }) => void;
  markRead: (id: string) => void;
  totalUnread: () => number;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: seeded,
  getById: (id) => get().conversations.find((c) => c.id === id),
  ensurePro: (providerId) => {
    if (get().conversations.some((c) => c.id === providerId)) return;
    const p = getProviderById(providerId);
    if (!p) return;
    set((s) => ({
      conversations: [
        {
          id: providerId,
          kind: 'pro',
          name: p.name,
          avatar: p.photo,
          subtitle: p.tagline,
          unread: 0,
          order: Math.max(0, ...s.conversations.map((c) => c.order)) + 1,
          messages: [],
        },
        ...s.conversations,
      ],
    }));
  },
  send: (id, input) => {
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      from: 'me',
      text: input.text,
      image: input.image,
      time: now(),
    };
    track('chat_send', { conversationId: id, hasImage: Boolean(input.image) });
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, messages: [...c.messages, msg], order: Date.now() } : c,
      ),
    }));
    // Support bot auto-replies.
    const convo = get().conversations.find((c) => c.id === id);
    if (convo?.kind === 'support' && input.text) {
      const reply = supportReply(input.text);
      setTimeout(() => {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    { id: `m${Date.now()}b`, from: 'them', text: reply, time: now() },
                  ],
                }
              : c,
          ),
        }));
      }, 1400);
    }
  },
  markRead: (id) =>
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    })),
  totalUnread: () => get().conversations.reduce((n, c) => n + c.unread, 0),
}));
