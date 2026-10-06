# Bookit — Data Model

Plain-English table definitions for v1. Every tenant-scoped table carries `channel_id` and is
isolated by Postgres row-level security. All tables have `id` (UUID, primary key),
`created_at`, and `updated_at` (timestamptz) unless noted.

Conventions: `FK` = foreign key. Money is stored in minor units (pence) as `integer`.

## users

The account record for anyone who signs in (customer, provider, or admin).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| channel_id | uuid | tenant scope |
| email | text | unique per channel |
| phone | text | nullable |
| full_name | text | |
| role | text (enum) | `customer` \| `provider` \| `admin` |
| password_hash | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## providers

A provider's marketplace profile. One-to-one with a `users` row of role `provider`.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| channel_id | uuid | tenant scope |
| user_id | uuid | FK → users |
| business_name | text | |
| bio | text | nullable |
| category | text (enum) | `cleaning` \| `barber_beauty` \| `tutoring` |
| location | geography(Point) | PostGIS, for proximity search |
| service_radius_m | integer | how far they travel, in metres |
| verification_status | text (enum) | `pending` \| `approved` \| `rejected` |
| stripe_account_id | text | Stripe Connect account; nullable until onboarded |
| rating_avg | numeric(3,2) | cached average; nullable |
| rating_count | integer | default 0 |
| is_live | boolean | visible to customers; default false |

## provider_documents

Verification documents uploaded by a provider, stored in Cloudflare R2.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| channel_id | uuid | tenant scope |
| provider_id | uuid | FK → providers |
| doc_type | text (enum) | e.g. `id`, `proof_of_address`, `certification` |
| r2_key | text | object key in R2 |
| status | text (enum) | `pending` \| `approved` \| `rejected` |
| reviewed_by | uuid | FK → users (admin); nullable |
| reviewed_at | timestamptz | nullable |

## services

A bookable service offered by a provider.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| channel_id | uuid | tenant scope |
| provider_id | uuid | FK → providers |
| name | text | |
| description | text | nullable |
| category | text (enum) | `cleaning` \| `barber_beauty` \| `tutoring` |
| price_minor | integer | price in pence |
| currency | text | ISO code, e.g. `GBP` |
| duration_min | integer | expected length in minutes |
| is_active | boolean | default true |

## availability_slots

Discrete time windows a provider is bookable.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| channel_id | uuid | tenant scope |
| provider_id | uuid | FK → providers |
| starts_at | timestamptz | |
| ends_at | timestamptz | |
| is_booked | boolean | default false |
| booking_id | uuid | FK → bookings; nullable, set when taken |

## bookings

A single booking between a customer and a provider.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| channel_id | uuid | tenant scope |
| customer_id | uuid | FK → users |
| provider_id | uuid | FK → providers |
| service_id | uuid | FK → services |
| slot_id | uuid | FK → availability_slots; nullable |
| status | text (enum) | see booking-states.md |
| scheduled_start | timestamptz | |
| scheduled_end | timestamptz | |
| address | text | where the service happens |
| location | geography(Point) | PostGIS |
| price_minor | integer | service price at booking time, in pence |
| platform_fee_minor | integer | 12% of price, in pence |
| currency | text | e.g. `GBP` |
| stripe_payment_intent_id | text | nullable |
| created_via | text (enum) | `app` \| `ai_assistant` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## booking_events

Append-only audit log: one row per state transition (see booking-states.md).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| channel_id | uuid | tenant scope |
| booking_id | uuid | FK → bookings |
| from_state | text | nullable (null for initial creation) |
| to_state | text | |
| triggered_by | text (enum) | `customer` \| `provider` \| `system` |
| actor_id | uuid | FK → users; nullable for system |
| reason | text (enum) | nullable; distinguishes transitions that share a `from → to` pair. For `requested → declined`: `provider_declined` \| `timeout` |
| metadata | jsonb | nullable (e.g. cancellation fee applied) |
| created_at | timestamptz | |

## reviews

A customer's rating and review of a completed booking. One per booking.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| channel_id | uuid | tenant scope |
| booking_id | uuid | FK → bookings; unique |
| customer_id | uuid | FK → users |
| provider_id | uuid | FK → providers |
| rating | smallint | 1–5 |
| comment | text | nullable |
| created_at | timestamptz | |

## payouts

A payout to a provider via Stripe Connect, for a completed and captured booking.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| channel_id | uuid | tenant scope |
| provider_id | uuid | FK → providers |
| booking_id | uuid | FK → bookings |
| gross_minor | integer | captured amount in pence |
| fee_minor | integer | platform fee (12%) in pence |
| net_minor | integer | amount paid to provider in pence |
| currency | text | e.g. `GBP` |
| stripe_transfer_id | text | nullable |
| status | text (enum) | `scheduled` \| `paid` \| `failed` |
| paid_at | timestamptz | nullable |
| created_at | timestamptz | |
