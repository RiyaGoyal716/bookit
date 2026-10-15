/**
 * Real-ish legal/policy content for the trust & safety pages. Rendered by the
 * dynamic `app/legal/[doc].tsx` screen. Kept as structured data so each page is
 * themeable, translatable and consistent.
 */
export interface LegalSection {
  heading: string;
  /** Body paragraphs. */
  body?: string[];
  /** Bulleted points. */
  bullets?: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  icon: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    icon: 'document-text-outline',
    updated: 'Last updated 13 Oct 2026',
    intro:
      'These terms govern your use of the Bookit app and marketplace. By creating an account or booking a service you agree to them.',
    sections: [
      {
        heading: '1. About Bookit',
        body: [
          'Bookit is a marketplace that connects customers with independent service providers ("pros"). Bookit is not the provider of the services and does not employ the pros listed in the app.',
        ],
      },
      {
        heading: '2. Your account',
        bullets: [
          'You must be 18 or older to book services.',
          'Provide accurate information and keep your login secure.',
          'You are responsible for activity on your account.',
        ],
      },
      {
        heading: '3. Bookings & payments',
        bullets: [
          'A 12% platform fee is added to each booking.',
          'You are charged once a pro accepts your request, unless you choose pay-after-service.',
          'Cancellations follow the Cancellation & Refund policy.',
        ],
      },
      {
        heading: '4. Conduct',
        body: [
          'Treat pros and customers with respect. Harassment, discrimination, fraud or unsafe behaviour may result in suspension or removal from the platform.',
        ],
      },
      {
        heading: '5. Liability',
        body: [
          'To the extent permitted by law, Bookit is not liable for the acts or omissions of independent pros. Our satisfaction guarantee is described in the booking policies.',
        ],
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    icon: 'lock-closed-outline',
    updated: 'Last updated 13 Oct 2026',
    intro:
      'We collect only what we need to run your bookings and keep the community safe. We never sell your personal data.',
    sections: [
      {
        heading: 'What we collect',
        bullets: [
          'Account details: name, phone, email.',
          'Booking details: address, service, schedule.',
          'Usage and device data to improve the app.',
        ],
      },
      {
        heading: 'How we use it',
        bullets: [
          'To match you with pros and process bookings.',
          'To provide support and prevent fraud.',
          'To send notifications you’ve opted into.',
        ],
      },
      {
        heading: 'Sharing',
        body: [
          'Your name, contact details and address are shared with a pro only after they accept your booking. Payment processing is handled by our PCI-compliant partners.',
        ],
      },
      {
        heading: 'Your rights',
        bullets: [
          'Access, correct or delete your data at any time.',
          'Withdraw consent for optional processing.',
          'Export a copy of your data from Settings.',
        ],
      },
    ],
  },
  'cancellation-refund': {
    slug: 'cancellation-refund',
    title: 'Cancellation & Refund',
    icon: 'time-outline',
    updated: 'Last updated 13 Oct 2026',
    intro: 'Clear, fair rules for changing or cancelling a booking.',
    sections: [
      {
        heading: 'Cancellation',
        bullets: [
          'Free cancellation up to 24 hours before your appointment.',
          'Within 24 hours a 50% charge may apply.',
          'No-shows are charged in full to compensate the pro.',
        ],
      },
      {
        heading: 'Refunds',
        bullets: [
          'Eligible refunds are returned to your original payment method within 3–5 business days.',
          'Wallet credit refunds are instant.',
        ],
      },
      {
        heading: 'If a pro cancels',
        body: [
          'If a pro cancels, you are fully refunded and we’ll help you rebook with another nearby pro.',
        ],
      },
    ],
  },
  'community-guidelines': {
    slug: 'community-guidelines',
    title: 'Community Guidelines',
    icon: 'people-outline',
    updated: 'Last updated 13 Oct 2026',
    intro: 'Bookit works because people treat each other well. These guidelines apply to everyone.',
    sections: [
      {
        heading: 'Be respectful',
        body: ['No harassment, hate speech or discrimination of any kind. Zero tolerance.'],
      },
      {
        heading: 'Be honest',
        bullets: [
          'Leave genuine reviews based on real bookings.',
          'Don’t manipulate ratings or impersonate others.',
        ],
      },
      {
        heading: 'Keep it on-platform',
        body: [
          'Booking and paying through Bookit keeps you covered by our guarantee and support. Off-platform deals are not protected.',
        ],
      },
    ],
  },
  'safety-guidelines': {
    slug: 'safety-guidelines',
    title: 'Safety Guidelines',
    icon: 'shield-checkmark-outline',
    updated: 'Last updated 13 Oct 2026',
    intro: 'Your safety comes first. Here’s how we help keep every booking secure.',
    sections: [
      {
        heading: 'Before a booking',
        bullets: [
          'Check the pro’s verified badges and reviews.',
          'Share your live booking with a trusted contact.',
          'Keep communication in the app.',
        ],
      },
      {
        heading: 'During a booking',
        bullets: [
          'Use the in-app call and chat.',
          'Trust your instincts — you can end a booking any time.',
          'Use the emergency button in the Safety Centre if you feel unsafe.',
        ],
      },
      {
        heading: 'Our commitment',
        body: ['Every pro is ID-verified and background-checked before going live.'],
      },
    ],
  },
  'pro-standards': {
    slug: 'pro-standards',
    title: 'Pro Standards',
    icon: 'ribbon-outline',
    updated: 'Last updated 13 Oct 2026',
    intro: 'The standards every Bookit pro agrees to uphold.',
    sections: [
      {
        heading: 'Performance targets',
        bullets: ['Acceptance rate ≥ 85%.', 'Average rating ≥ 4.5.', 'Cancellation rate ≤ 5%.'],
      },
      {
        heading: 'Professional conduct',
        bullets: [
          'Arrive on time and communicate proactively.',
          'Deliver the agreed scope to a high standard.',
          'Never request off-platform payment.',
        ],
      },
    ],
  },
  'cookie-policy': {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    icon: 'cafe-outline',
    updated: 'Last updated 13 Oct 2026',
    intro: 'How we use cookies and similar technologies.',
    sections: [
      {
        heading: 'Essential',
        body: ['Required to run the app, keep you signed in and process bookings securely.'],
      },
      {
        heading: 'Analytics',
        body: ['Help us understand usage so we can improve. You can opt out in data settings.'],
      },
      {
        heading: 'Marketing',
        body: ['Used only with your consent to show relevant offers. Off by default.'],
      },
    ],
  },
};

export const LEGAL_INDEX: { slug: string; title: string; icon: string }[] = Object.values(
  LEGAL_DOCS,
).map((d) => ({ slug: d.slug, title: d.title, icon: d.icon }));
