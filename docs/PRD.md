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
