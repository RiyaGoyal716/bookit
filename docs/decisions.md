# Bookit — Decision Log

A running record of notable product and technical decisions. Add a new row each time a
decision is made. Newest at the top.

Template: `date | decision | why`

| Date | Decision | Why |
|------|----------|-----|
| 2026-10-06 | Provider response window for `requested` bookings is 15 minutes; after this the system auto-declines. | Keeps customers from waiting indefinitely and protects marketplace liquidity; short enough to retry with another provider quickly. |
| 2026-10-06 | No cancellation allowed once a booking is `in_progress`; it can only move to `completed`. Disputes are deferred to v2. | A service that has started should be seen through or resolved by a person, not cancelled by either party mid-job; dispute handling is v2 scope. |
| 2026-10-06 | `requested → declined` is a single transition for both provider decline and system timeout, distinguished by a `reason` column (`provider_declined` \| `timeout`) on `booking_events`. | Avoids a duplicate state/transition while still letting analytics tell the two causes apart. |
