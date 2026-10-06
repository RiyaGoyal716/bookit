# Bookit — Architecture

## Overview

Bookit is a mobile app backed by an existing NestJS API. One backend serves multiple
marketplaces via multi-tenancy (`channel_id` + Postgres row-level security); Leeds is the
first channel.

## Text diagram

```
 ┌─────────────────────────────┐
 │   Mobile app (customers      │
 │   + providers)               │
 │   Expo React Native + TS     │
 └──────────────┬──────────────┘
                │ HTTPS (REST/JSON, JWT auth)
                ▼
 ┌─────────────────────────────────────────────────────────┐
 │                   NestJS API (existing)                   │
 │                                                           │
 │   Auth · Providers · Services · Availability · Bookings   │
 │   Reviews · Payouts · Admin · AI Assistant                │
 │                                                           │
 │   Multi-tenant: every request scoped by channel_id,       │
 │   enforced by Postgres RLS                                │
 └───┬───────────┬───────────┬───────────┬──────────┬───────┘
     │           │           │           │          │
     ▼           ▼           ▼           ▼          ▼
 ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
 │Postgres│ │ Redis  │ │Cloudflare│ │ Stripe │ │   LLM    │
 │+PostGIS│ │        │ │   R2     │ │+Connect│ │ provider │
 └────────┘ └────────┘ └──────────┘ └────────┘ └──────────┘
  data +     cache,      document     payments    function
  geo        queues,     + image      + payouts   calling for
  queries    sessions    storage                  AI assistant

 ┌─────────────────────────────┐
 │  Stripe → webhooks → NestJS  │  (payment capture, payout events)
 └─────────────────────────────┘
 ┌─────────────────────────────┐
 │  NestJS → push provider →    │  (booking status notifications)
 │  mobile app                  │
 └─────────────────────────────┘
```

## Components

- **Mobile app** — Expo (React Native) + TypeScript. One codebase for both customer and
  provider experiences, gated by role. Talks to the API over HTTPS with JWT auth.
- **NestJS API** — the existing backend. Owns all business logic, the booking state machine,
  and tenant isolation.
- **Postgres + PostGIS** — primary datastore. PostGIS powers "providers near me" distance and
  radius queries.
- **Redis** — caching, background job queues (e.g. notifications, payout scheduling), session
  and rate-limit data.
- **Cloudflare R2** — object storage for provider verification documents and profile/service
  images.
- **Stripe + Stripe Connect** — customer payments (held until completion), platform-fee
  deduction, and provider payouts to connected accounts. Stripe webhooks drive the
  `completed → paid` transition.
- **LLM provider** — powers the AI assistant via function calling: the model is given tools
  (search providers, check availability, create booking) and invokes them against the API.

## Key technical decisions

- **One mobile codebase, role-gated.** Customers and providers share an Expo app; the UI and
  permitted actions depend on the signed-in role. Faster to ship than two apps for v1.
- **Backend owns the state machine.** All booking transitions are validated server-side. The
  app never sets a booking state directly; it calls intent endpoints (e.g. "accept"), and the
  API enforces the allowed transitions in booking-states.md.
- **Multi-tenancy via `channel_id` + RLS.** Every tenant-scoped table carries a `channel_id`;
  Postgres row-level security guarantees a request can only ever read/write its own channel's
  rows, so isolation does not depend on application code remembering to filter.
- **PostGIS for discovery.** Provider and booking locations are stored as geography points;
  proximity search uses PostGIS indexes rather than hand-rolled distance maths.
- **Funds held, not captured, at booking.** Payment is authorised when the customer books and
  only captured once the service is `completed`, giving both sides protection. Capture, fee
  deduction, and payout run through Stripe Connect.
- **AI assistant as a thin function-calling layer.** The assistant has no privileged access —
  it calls the same API endpoints a customer would, with the customer's own auth, so all
  tenant and permission rules still apply.
- **R2 for storage, keeping blobs out of Postgres.** Documents and images live in R2;
  Postgres stores only references.
