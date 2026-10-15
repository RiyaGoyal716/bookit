# Bookit

**Bookit** is a two-sided, hyperlocal services marketplace. Customers find, book,
and pay verified local providers for everyday services — **cleaning**,
**barber / beauty**, and **tutoring** — while providers get a steady stream of
nearby, pre-qualified work.

A built-in **AI assistant** can find availability and complete bookings on the
customer's behalf. Bookit launches in **Leeds** and charges a **12% platform
fee** on each booking.

## Screenshots

The **NOVA** redesign (2026) is a complete visual/UX rebuild to current industry
standard — content-first, neutral surfaces, one accent (`#6D5BFF`), a geometric
"b" brand mark, a single `<Icon>` system and a token-only component library.
Every screen supports **light, dark and RTL (en/hi/ar)** and stays Expo Go
compatible. Drop image files into `docs/screenshots/` and uncomment the rows
below (capture each in **light and dark**).

| Area | Screens |
| ---- | ------- |
| Home & Explore | 6-block Home, smart search/concierge, Explore (list/map, compare) |
| Discovery & provider | Categories, provider profile (tabs), compare tray |
| Booking & payments | Checkout sheet flow, slide-to-confirm, confetti success |
| Bookings | Upcoming/Past/Cancelled, live-activity pill, tracking, invoice, rate |
| Inbox | Conversations, chat with pro, grouped notification centre |
| Account | Inset grouped lists, Bookit Plus, biometric lock (PIN), settings |
| Provider mode | Today (KPIs, requests), jobs, earnings |
| Design system | `app/dev/design-system` — every token & component, light/dark |

<!-- Light / dark pairs:
| Screen | Light | Dark |
| ------ | ----- | ---- |
| Home | ![Home light](docs/screenshots/home-light.png) | ![Home dark](docs/screenshots/home-dark.png) |
| Explore | ![Explore light](docs/screenshots/explore-light.png) | ![Explore dark](docs/screenshots/explore-dark.png) |
| Design system | ![DS light](docs/screenshots/ds-light.png) | ![DS dark](docs/screenshots/ds-dark.png) |
| App icon | ![Icon](apps/mobile/assets/icon.png) | |
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
