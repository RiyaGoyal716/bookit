# Bookit

**Bookit** is a two-sided, hyperlocal services marketplace. Customers find, book,
and pay verified local providers for everyday services — **cleaning**,
**barber / beauty**, and **tutoring** — while providers get a steady stream of
nearby, pre-qualified work.

A built-in **AI assistant** can find availability and complete bookings on the
customer's behalf. Bookit launches in **Leeds** and charges a **12% platform
fee** on each booking.

## Screenshots

The **Aurora** redesign spans 40+ screens across the customer app, a full
provider ("pro") side, and trust & safety — all Expo Go compatible with light,
dark and RTL support. Drop image files into `docs/screenshots/` and uncomment
the rows below.

| Area | Screens |
| ---- | ------- |
| Discovery & provider | Home, category (packages + map toggle), provider profile, compare |
| Booking & payments | Cart, checkout (slot/address/recurring/payment), confetti success |
| Bookings | Upcoming/Completed/Cancelled, live tracking, invoice, rate |
| Inbox | Conversations, chat with pro, support bot, notifications |
| Account | Wallet, Bookit Plus, security (PIN), profile, settings |
| Provider mode | Onboarding, dashboard, job requests, earnings, availability |
| Trust & safety | Safety centre, account status, report/tickets, legal docs |

<!--
![Home](docs/screenshots/home.png)
![Live tracking](docs/screenshots/tracking.png)
![Pro dashboard](docs/screenshots/pro-dashboard.png)
![Wallet](docs/screenshots/wallet.png)
![Safety centre](docs/screenshots/safety.png)
-->

## Documentation

Product and technical docs live in [`/docs`](./docs):

- [PRD](./docs/PRD.md) — product requirements
- [Architecture](./docs/architecture.md) — system architecture
- [Booking states](./docs/booking-states.md) — booking state machine
- [Data model](./docs/data-model.md) — core entities
- [Decisions](./docs/decisions.md) — key decisions log

## Run locally

The mobile app is an [Expo](https://expo.dev) project under
[`apps/mobile`](./apps/mobile).

```bash
cd apps/mobile
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android emulator), or `w` (web), or scan
the QR code with the Expo Go app.

### Useful scripts

Run these from `apps/mobile`:

| Script              | What it does                 |
| ------------------- | ---------------------------- |
| `npm run lint`      | ESLint                       |
| `npm run typecheck` | TypeScript (`tsc --noEmit`)  |
| `npm test`          | Jest                         |
| `npm run format`    | Prettier (write)             |

### Environment

Copy `apps/mobile/.env.example` to `apps/mobile/.env` and fill in the values
(`API_URL`, `SENTRY_DSN`, `STRIPE_PUBLISHABLE_KEY`).
