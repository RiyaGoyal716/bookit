import { create } from 'zustand';

import { track } from '../lib/analytics';

export type VerificationStatus = 'not_started' | 'pending' | 'verified';

export type ProJobStatus =
  | 'request' // incoming, needs accept/decline
  | 'offer' // posted task to quote on
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'declined';

export interface ProJob {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  /** Payout to the pro in whole GBP. */
  amount: number;
  area: string;
  status: ProJobStatus;
  /** For requests: seconds remaining to respond (countdown). */
  expiresInSec?: number;
  /** For offers: the customer's posted budget. */
  budget?: number;
}

export interface WeeklyEarning {
  label: string;
  amount: number;
}

/** Day-of-week availability (Mon..Sun), each a list of enabled slot labels. */
export type Availability = Record<string, string[]>;

export const PRO_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];
export const PRO_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const seededJobs: ProJob[] = [
  {
    id: 'J-1001',
    customer: 'Priya S.',
    service: 'Deep clean (2 bed)',
    date: 'Today',
    time: '13:00',
    amount: 54,
    area: 'Headingley, LS6',
    status: 'scheduled',
  },
  {
    id: 'J-1002',
    customer: 'Tom H.',
    service: 'Regular clean',
    date: 'Today',
    time: '16:00',
    amount: 32,
    area: 'Hyde Park, LS6',
    status: 'scheduled',
  },
  {
    id: 'J-1003',
    customer: 'Aisha K.',
    service: 'End of tenancy',
    date: 'Tomorrow',
    time: '09:00',
    amount: 96,
    area: 'Burley, LS4',
    status: 'request',
    expiresInSec: 90,
  },
  {
    id: 'J-1004',
    customer: 'Daniel O.',
    service: 'Oven clean',
    date: 'Thu 16 Oct',
    time: '11:00',
    amount: 45,
    area: 'Chapel Allerton, LS7',
    status: 'request',
    expiresInSec: 120,
  },
  {
    id: 'J-2001',
    customer: 'Grace M.',
    service: 'Weekly clean (posted task)',
    date: 'Flexible',
    time: 'Mornings',
    amount: 0,
    area: 'Roundhay, LS8',
    status: 'offer',
    budget: 40,
  },
];

const defaultAvailability: Availability = PRO_DAYS.reduce((acc, day) => {
  acc[day] = day === 'Sun' ? [] : ['09:00', '11:00', '13:00', '15:00'];
  return acc;
}, {} as Availability);

export const WEEKLY_EARNINGS: WeeklyEarning[] = [
  { label: 'Mon', amount: 86 },
  { label: 'Tue', amount: 54 },
  { label: 'Wed', amount: 132 },
  { label: 'Thu', amount: 70 },
  { label: 'Fri', amount: 148 },
  { label: 'Sat', amount: 196 },
  { label: 'Sun', amount: 0 },
];

/** Payout record. */
export interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending';
}

const seededPayouts: Payout[] = [
  { id: 'PO-9', date: '6 Oct 2026', amount: 420, status: 'paid' },
  { id: 'PO-8', date: '29 Sep 2026', amount: 385, status: 'paid' },
  { id: 'PO-7', date: '22 Sep 2026', amount: 512, status: 'paid' },
];

interface ProviderState {
  verification: VerificationStatus;
  onboarding: { documents: boolean; selfie: boolean; bank: boolean };
  jobs: ProJob[];
  availability: Availability;
  payouts: Payout[];
  rating: number;
  /** 0..100 acceptance rate. */
  acceptanceRate: number;
  setOnboardingStep: (key: 'documents' | 'selfie' | 'bank', done: boolean) => void;
  submitVerification: () => void;
  completeVerification: () => void;
  acceptJob: (id: string) => void;
  declineJob: (id: string) => void;
  advanceJob: (id: string) => void;
  sendQuote: (id: string, amount: number) => void;
  toggleSlot: (day: string, slot: string) => void;
  /** Sum of amounts for completed/scheduled/in-progress jobs (this week, demo). */
  weekEarnings: () => number;
}

/** Count jobs in a given status. */
export function countByStatus(jobs: ProJob[], status: ProJobStatus): number {
  return jobs.filter((j) => j.status === status).length;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  verification: 'not_started',
  onboarding: { documents: false, selfie: false, bank: false },
  jobs: seededJobs,
  availability: defaultAvailability,
  payouts: seededPayouts,
  rating: 4.9,
  acceptanceRate: 94,

  setOnboardingStep: (key, done) => set((s) => ({ onboarding: { ...s.onboarding, [key]: done } })),

  submitVerification: () => {
    track('pro_submit_verification');
    set({ verification: 'pending' });
  },
  completeVerification: () => set({ verification: 'verified' }),

  acceptJob: (id) => {
    track('pro_accept_job', { jobId: id });
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.id === id ? { ...j, status: 'scheduled', expiresInSec: undefined } : j,
      ),
    }));
  },
  declineJob: (id) => {
    track('pro_decline_job', { jobId: id });
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.id === id ? { ...j, status: 'declined', expiresInSec: undefined } : j,
      ),
    }));
  },
  advanceJob: (id) =>
    set((s) => ({
      jobs: s.jobs.map((j) => {
        if (j.id !== id) return j;
        if (j.status === 'scheduled') return { ...j, status: 'in_progress' };
        if (j.status === 'in_progress') return { ...j, status: 'completed' };
        return j;
      }),
    })),
  sendQuote: (id, amount) => {
    track('pro_send_quote', { jobId: id, amount });
    set((s) => ({
      jobs: s.jobs.map((j) =>
        j.id === id ? { ...j, status: 'scheduled', amount, expiresInSec: undefined } : j,
      ),
    }));
  },
  toggleSlot: (day, slot) =>
    set((s) => {
      const current = s.availability[day] ?? [];
      const next = current.includes(slot) ? current.filter((x) => x !== slot) : [...current, slot];
      return { availability: { ...s.availability, [day]: next } };
    }),

  weekEarnings: () =>
    get()
      .jobs.filter(
        (j) => j.status === 'scheduled' || j.status === 'in_progress' || j.status === 'completed',
      )
      .reduce((sum, j) => sum + j.amount, 0),
}));
