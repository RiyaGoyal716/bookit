# Bookit — Booking State Machine

This describes the lifecycle of a single booking.

## States

| State | Meaning |
|-------|---------|
| `requested` | Customer has requested the booking and paid; funds are authorised/held. Awaiting provider response. |
| `accepted` | Provider has agreed to the booking. |
| `declined` | Provider turned the request down (or it timed out before a response). Terminal. |
| `on_the_way` | Provider has marked themselves as travelling to the customer. |
| `in_progress` | The service is being carried out. |
| `completed` | Provider has marked the service finished. |
| `cancelled_by_customer` | Customer cancelled before completion. Terminal. |
| `cancelled_by_provider` | Provider cancelled before completion. Terminal. |
| `paid` | Payment captured, platform fee taken, payout scheduled to the provider. |
| `reviewed` | Customer has left a rating and review. Terminal. |

### Terminal states
`declined`, `cancelled_by_customer`, `cancelled_by_provider`, `reviewed`, and `paid`
(if the customer never leaves a review) are end states — no transitions leave them except
`paid → reviewed`.

## Transition table

One row per allowed transition. "Trigger" is who causes it: **customer**, **provider**, or
**system** (automated / payment processor).

| # | From | To | Trigger | Side effects |
|---|------|------|---------|--------------|
| 1 | *(new)* | `requested` | customer | Authorise and hold payment on card; push to provider; start response timer |
| 2 | `requested` | `accepted` | provider | Push to customer; payment hold retained |
| 3 | `requested` | `declined` | provider / system | Release payment hold; push to customer. Record `reason` on the event: `provider_declined` (provider acted) or `timeout` (system auto-decline after the response window) |
| 4 | `requested` | `cancelled_by_customer` | customer | Release payment hold; push to provider |
| 5 | `accepted` | `on_the_way` | provider | Push to customer |
| 6 | `accepted` | `cancelled_by_customer` | customer | Release hold or charge cancellation fee per policy; push to provider |
| 7 | `accepted` | `cancelled_by_provider` | provider | Release payment hold; push to customer; flag provider reliability |
| 8 | `on_the_way` | `in_progress` | provider | Push to customer (service started) |
| 9 | `on_the_way` | `cancelled_by_customer` | customer | Charge cancellation fee per policy; push to provider |
| 10 | `on_the_way` | `cancelled_by_provider` | provider | Release payment hold; push to customer; flag provider reliability |
| 11 | `in_progress` | `completed` | provider | Push to customer to confirm; request payment capture |
| 12 | `completed` | `paid` | system | Capture payment via Stripe; deduct 12% platform fee; schedule provider payout via Stripe Connect; push receipt to customer |
| 13 | `paid` | `reviewed` | customer | Store review; recompute provider rating; push to provider |

## Notes

- Every transition appends a row to `booking_events` for audit (see data-model.md).
- Row 3 (`requested → declined`) is a single transition for both the provider declining and the
  system timing out. The two are distinguished for analytics by the `reason` column on
  `booking_events`: `provider_declined` vs `timeout`. The response window is 15 minutes
  (see decisions.md).
- Cancellation fee logic (rows 6, 9) is governed by the cancellation policy and is applied
  against the held authorisation; the exact thresholds are a policy decision, not part of the
  state machine.
- A booking can only ever move forward or to a terminal cancelled/declined state — there are no
  backward transitions.
