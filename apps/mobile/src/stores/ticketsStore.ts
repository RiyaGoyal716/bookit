import { create } from 'zustand';

import { track } from '../lib/analytics';

export type TicketStatus = 'open' | 'in_review' | 'resolved';

export interface TicketUpdate {
  text: string;
  time: string;
  /** True when the update is from the support team. */
  fromSupport: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updates: TicketUpdate[];
}

export const TICKET_CATEGORIES = [
  'Booking issue',
  'Payment or refund',
  'Pro behaviour',
  'Safety concern',
  'App bug',
  'Something else',
];

function today(): string {
  const d = new Date();
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

const seeded: Ticket[] = [
  {
    id: 'TK-4821',
    subject: 'Refund not received',
    category: 'Payment or refund',
    description: 'My cancelled clean on 9 Oct hasn’t been refunded yet.',
    status: 'in_review',
    createdAt: '10 Oct 2026',
    updates: [
      {
        text: 'Thanks — we’re looking into your refund and will update you within 24h.',
        time: '10 Oct',
        fromSupport: true,
      },
    ],
  },
];

interface TicketsState {
  tickets: Ticket[];
  getById: (id: string) => Ticket | undefined;
  create: (input: { subject: string; category: string; description: string }) => Ticket;
}

export const useTicketsStore = create<TicketsState>((set, get) => ({
  tickets: seeded,
  getById: (id) => get().tickets.find((t) => t.id === id),
  create: ({ subject, category, description }) => {
    const ticket: Ticket = {
      id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      category,
      description,
      status: 'open',
      createdAt: today(),
      updates: [
        {
          text: 'Your report has been received. A specialist will respond shortly.',
          time: 'Just now',
          fromSupport: true,
        },
      ],
    };
    track('report_problem', { category });
    set((s) => ({ tickets: [ticket, ...s.tickets] }));
    return ticket;
  },
}));
