# Bookit — Product Requirements Document (v1)

## Problem

Finding a trustworthy local service provider (a cleaner, a barber, a tutor) is slow and
uncertain. Customers rely on word of mouth, scattered Facebook groups, or directories with
stale listings and no way to tell who is actually available, verified, or any good. Booking
usually means a phone-tag back-and-forth, and paying means cash or an awkward bank transfer
with no protection for either side.

Providers have the mirror-image problem: they spend unpaid time chasing leads, confirming
times over text, and collecting payment, with no reliable stream of new customers.

## Solution

Bookit is a two-sided hyperlocal marketplace. Customers discover **verified** local providers
near them, see real availability, book a specific slot, and pay in-app with their money held
until the job is done. Providers manage their services, availability, and payouts in one place.
An AI assistant can carry out the discovery-and-booking flow on a customer's behalf in plain
language ("book me a cleaner for Saturday morning near LS6").

**Launch city:** Leeds. **Platform fee:** 12% of each booking, deducted from the provider's payout.

## Target users

- **Customers** — Leeds residents who want a local service done, value speed and trust, and are
  comfortable paying in-app.
- **Providers** — independent local tradespeople and small businesses (cleaning, barber/beauty,
  tutoring) who want a steady flow of bookings without the admin.

## Roles

### Customer
Finds, books, pays for, and reviews services.

### Provider
Lists services, sets availability, accepts/declines and fulfils bookings, receives payouts.
Must be verified before going live.

### Admin
Bookit staff. Verifies providers, resolves disputes, manages the marketplace.

## v1 features by role

### Customer
- Sign up / sign in
- Search and browse providers by category (cleaning, barber/beauty, tutoring) and location
- View a provider profile: services, prices, availability, rating, reviews
- Book a specific available slot
- Pay in-app via Stripe; funds held until the job is completed
- Track booking status (requested → accepted → on the way → in progress → completed)
- Cancel a booking (subject to the cancellation policy)
- Leave a rating and review after completion
- Use the AI assistant to find and book on their behalf in natural language
- Receive push notifications for status changes

### Provider
- Sign up / sign in and complete a verification application (upload ID / documents)
- Create and edit services (name, description, price, duration, category)
- Set availability as bookable slots
- Receive and accept or decline booking requests
- Advance a booking through its lifecycle (on the way, in progress, completed)
- Cancel a booking (subject to policy)
- View upcoming and past bookings
- See payout history and status (via Stripe Connect)
- Receive push notifications for new requests and updates

### Admin
- Review provider verification applications and approve or reject them
- View and inspect bookings
- Suspend or reinstate providers
- Handle refunds / dispute resolution

## v1.1 — Customer app features (demo)

The polished customer demo adds an international phone sign-in and 15 core
features. All are mock-backed and run in Expo Go.

**Authentication**

- **International phone input** — searchable country picker (flag, name, dial
  code) defaulting to the device region, live `AsYouType` formatting, and
  mobile-number validation via `libphonenumber-js`. The number is stored and
  displayed in E.164. OTP screen uses four auto-advancing boxes with
  auto-submit, a 30s resend countdown and a "Change number" link.

**Core features**

1. **Favourites** — heart toggle on provider cards and the profile, with a
   Favourites section on the Profile tab.
2. **Search** — real-time across provider *and* service names, with recent
   searches kept for the session.
3. **Sort & filter** — bottom sheet: sort by rating / price / distance; filter
   by price range, rating 4+, and available today.
4. **Availability** — "Available today" badge and next free slot on cards and
   the provider profile.
5. **Reviews** — reviews list on the provider profile; "Write a review" (stars
   + text) on completed bookings.
6. **Booking management** — cancel (with confirm) and reschedule, a booking
   detail screen with call/message contact and a status timeline
   (Requested → Accepted → On the way → Completed).
7. **Notifications** — notifications screen with an unread dot on the home bell.
8. **Promo code** — `BOOKIT10` gives 10% off on the review screen.
9. **Address book** — save Home/Work addresses, pick one during booking, or use
   the current location (expo-location, permission handled gracefully).
10. **Onboarding** — a 3-slide carousel (Find → Book → Relax) with Skip, shown
    before Welcome.
11. **Settings** — notifications toggle, dark-mode preference (System / Light /
    Dark), language placeholder, and delete account.
12. **Help & support** — FAQ accordion and a contact form.
13. **Share provider** — native share sheet (React Native `Share`).
14. **Offline banner** — connectivity banner via expo-network.
15. **Error boundary** — app-wide boundary with a friendly retry screen.

## Aurora full-app features (2026-10-13)

The Aurora redesign extends the app to 40+ screens across both the customer and a
full provider ("pro") side, plus trust & safety. Everything is mock-backed and
Expo Go compatible (no new native deps).

### Discovery & provider
- Category page with sub-services, **bundles/packages**, filters/sort sheet and a
  **map-toggle placeholder** (styled SVG panel).
- Richer provider profile: gallery + full-screen viewer, stats, trust badges
  (Verified ID, Background checked, Insured, Top rated, **Fast responder**),
  reviews with filters + photos, availability, policies, FAQ and **Pros like this**.
- **Compare providers** — select up to 3 and view side-by-side.

### Booking & payments
- Cart with add-ons, tips, promo and currency-aware breakdown.
- Slot picker, address book (map placeholder + instructions), **recurring**
  (weekly/fortnightly), payment methods (cards, Apple/Google Pay, **wallet**,
  pay-after-service — all mock), review → confetti success → add-to-calendar + share.

### Bookings & live tracking
- Upcoming/Completed/Cancelled segments.
- **Live tracking**: an animated pro marker eased along an SVG route
  (`RouteMapTracker`), ETA card and a status timeline.
- Chat, call, **mock invoice (PDF)**, reschedule, cancel with policy + reasons,
  rebook, and rate with tags/photos/tip.

### Inbox & notifications
- Chats with pros and a **mock support bot** (bubbles, images, quick replies,
  typing indicator); notification centre grouped by day; in-app toast + banner
  system; notification preferences.

### Account
- Profile, addresses, payments, **wallet & transactions**, favourites, referrals,
  **Bookit Plus** (benefits, mock subscribe, billing), language & region, dark
  mode, **security (mock PIN + biometric)**, delete account.

### Provider mode (`app/pro/*`)
- Onboarding (document + selfie upload, bank details) and verification status.
- Dashboard (today's jobs, earnings, rating, acceptance rate, **weekly SVG chart**),
  job requests with **countdown accept/decline**, quote on posted tasks, job detail
  with status buttons, availability editor, earnings & payouts, pro standards +
  performance warnings.

### Trust, safety & policy
- Real-content legal pages (Terms, Privacy, Cancellation & Refund, Community,
  Safety, Pro Standards, Cookie), report-a-problem with ticket tracking, account
  status (Active/Under review/Restricted) + appeal, safety centre (emergency,
  share live booking, trusted contacts), violation notices, maintenance/app-update
  and data & consent screens.

### How the Expo Go-safe pieces are built
- **Maps**: `MapPlaceholder` (SVG street grid + pins) and `RouteMapTracker`
  (reanimated marker interpolated along an SVG polyline). No `react-native-maps`.
- **Charts**: `BarChart` drawn with `react-native-svg` and the Aurora gradient.
- **Motion**: `moti` for shimmer, heart pop, reveals and typing dots.

## Out of scope for v1

The following are explicitly **not** in v1:

- Cities other than Leeds; multi-city rollout
- Categories beyond cleaning, barber/beauty, and tutoring
- Recurring / subscription bookings
- In-app chat / messaging between customer and provider
- Provider teams or multi-staff accounts (one provider = one person in v1)
- Tipping
- Promo codes, discounts, referral or loyalty programmes
- Customer or provider wallets / stored balance
- Dynamic or surge pricing
- Favourites / saved providers
- Web app for customers (mobile app only in v1)
- Multi-language / localisation beyond English
- Group or shared bookings
- Gift cards
- Dispute handling (disputed state) — v2

## Success metrics

- **Liquidity:** % of booking requests accepted by a provider within the response window
- **Completion rate:** % of accepted bookings that reach `completed`
- **GMV:** total value of completed bookings per week
- **Repeat rate:** % of customers who book a second time within 30 days
- **Verified supply:** number of verified, live providers per category in Leeds
- **AI assistant adoption:** % of bookings initiated through the assistant
- **Review coverage:** % of completed bookings that receive a review
