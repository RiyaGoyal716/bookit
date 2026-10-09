# Bookit — Decision Log

A running record of notable product and technical decisions. Add a new row each time a
decision is made. Newest at the top.

Template: `date | decision | why`

| Date | Decision | Why |
|------|----------|-----|
| 2026-10-09 | Phone validation uses `libphonenumber-js` and accepts a number when valid and either mobile-typed or of unknown type (rejecting only known non-mobile types). | India (and some others) report no type for valid mobiles, so a strict "must be MOBILE" check would wrongly reject them; rejecting only known landlines keeps GB/IN/US all working. |
| 2026-10-09 | Dark-mode preference is a `'system' \| 'light' \| 'dark'` store resolved inside `useColors()`/`useColorSchemeName()`, overriding the OS scheme. | Keeps a single source of truth for colours and lets every existing screen honour a user override with no per-screen changes. |
| 2026-10-09 | All new features are mock-backed with session-only Zustand stores (no persistence, no MMKV in the runtime graph). | Keeps the demo fully Expo Go compatible and avoids native dependencies while still exercising real UI state and flows. |
| 2026-10-09 | Standardised on `@shopify/flash-list` for every list and `expo-image` (placeholder + `cachePolicy`) for every image. | Consistent performance and caching across the app, and a single pattern for contributors to follow. |
| 2026-10-06 | Provider response window for `requested` bookings is 15 minutes; after this the system auto-declines. | Keeps customers from waiting indefinitely and protects marketplace liquidity; short enough to retry with another provider quickly. |
| 2026-10-06 | No cancellation allowed once a booking is `in_progress`; it can only move to `completed`. Disputes are deferred to v2. | A service that has started should be seen through or resolved by a person, not cancelled by either party mid-job; dispute handling is v2 scope. |
| 2026-10-06 | `requested → declined` is a single transition for both provider decline and system timeout, distinguished by a `reason` column (`provider_declined` \| `timeout`) on `booking_events`. | Avoids a duplicate state/transition while still letting analytics tell the two causes apart. |
