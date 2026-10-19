# Feature Parity — Prompts 1–6 → NOVA v3

Every feature built in prompts 1–6 is preserved by the v3 rebuild. v3 changes only
the presentation layer (colour, type, icons, illustrations, layout density): stores,
mock-data shapes, i18n keys, route paths and analytics keep working. Nothing is
deleted — rows are "kept + re-skinned" or "moved" (with a redirect where a path
changed). Tick ✅ = verified working after v3.

Status key: ✅ kept + re-skinned to v3 · ➡️ moved (same behaviour, new home) · 🆕 added by v3.

| # | Feature (prompt 1–6) | Old location | New location (v3) | Status |
|---|----------------------|--------------|-------------------|--------|
| 1 | Onboarding intro slides | `app/onboarding.tsx` | same — Fluent 3D illustrations, Bricolage copy | ✅ |
| 2 | Choose region (currency/dial/date) | `app/region.tsx` + `regionStore` | same — `useMoney()`/`useDirection()` unchanged | ✅ |
| 3 | Phone + OTP sign in, resend, guest | `app/login.tsx`, `app/otp.tsx` + `authStore` | same — OTP boxes, 30s resend, Apple/Google/guest | ✅ |
| 4 | Permission primers (location, notifications) | `app/permissions.tsx` | same — Fluent 3D primers | ✅ |
| 5 | Home feed | `app/(tabs)/index.tsx` | same — new order: header+LiveChip, search, categories, bento, rails, offers, trust | ✅ |
| 6 | Category browse | `app/category/[slug].tsx` | same — tint hero + 3D icon, scroll-spy chips, Packages, 2-col grid | ✅ |
| 7 | Search (NL concierge, recent, trending) | `app/search.tsx`, `app/concierge.tsx` + `searchStore` | same — rotating placeholder, smart parser | ✅ |
| 8 | Explore (grid, rails, map toggle, compare) | `app/(tabs)/explore.tsx`, `app/compare.tsx` + `compareStore` | same — list/map toggle, compare tray (3) | ✅ |
| 9 | Provider profile (gallery, tabs, reviews) | `app/provider/[id].tsx` + `providerStore`, `reviewsStore` | same — ink Book bar, sky verified, sunshine rating | ✅ |
| 10 | Booking flow | `app/booking/[providerId].tsx` | same | ✅ |
| 11 | Cart / basket | `app/cart.tsx` + `cartStore` | same — ink BookingBar, "+"→stepper, live total | ✅ |
| 12 | Checkout (steps, add-ons, tip, promo, recurring, pay) | `app/checkout.tsx` | same — collapsible steps, slide-to-confirm | ✅ |
| 13 | Payment methods / wallet | `app/payments.tsx`, `app/wallet.tsx` + `walletStore` | same | ✅ |
| 14 | Success + confetti + calendar/share | `app/success.tsx` | same — green confetti, Fluent 3D party popper | ✅ |
| 15 | Bookings (Upcoming/Past/Cancelled, swipe) | `app/(tabs)/bookings.tsx` + `bookingsStore` | same — segmented, swipe actions | ✅ |
| 16 | Booking detail (timeline, chat, call, invoice, rating) | `app/booking-detail/[id].tsx`, `app/invoice/[id].tsx`, `app/review.tsx` | same | ✅ |
| 17 | Live tracking (ETA, route) | `app/tracking/[id].tsx` | same — sky tracking, LivePill | ✅ |
| 18 | Inbox (chats + notifications, grouped, filters) | `app/(tabs)/inbox.tsx`, `app/chat/[id].tsx` + `chatStore`, `notificationsStore` | same — swipe to mark read | ✅ |
| 19 | Account hub | `app/(tabs)/account.tsx` | same — coloured IconChip rows; side drawer items folded in | ➡️ |
| 20 | Profile edit | `app/profile.tsx` | same | ✅ |
| 21 | Settings (theme, language, haptics, about/licences) | `app/settings.tsx` + `settingsStore`, `themeStore` | same — haptics off switch, About › Licences | ✅ |
| 22 | Addresses | `app/addresses.tsx` + `addressStore` | same — address sheet | ✅ |
| 23 | Favourites | `app/favourites.tsx` + `favouritesStore` | same — heart pop (coral) | ✅ |
| 24 | Offers / promos | `app/offers.tsx` | same — coral/sky/sunshine offer cards | ✅ |
| 25 | Bookit Plus | `app/plus.tsx` + `plusStore` | same — ink + sunshine Plus card, crown | ✅ |
| 26 | Referrals | `app/referrals.tsx` | same | ✅ |
| 27 | Post a job / instant estimate | `app/post-job.tsx` | same | ✅ |
| 28 | Notifications + preferences | `app/notifications.tsx`, `app/notification-preferences.tsx` + `notificationPrefsStore` | same | ✅ |
| 29 | Help / support | `app/help.tsx` | same | ✅ |
| 30 | Legal / policies | `app/legal.tsx`, `app/legal/[doc].tsx`, `app/policies.tsx`, `app/consent.tsx` + `consentStore` | same — PolicyPage | ✅ |
| 31 | Trust & safety (report, safety, violation, account status) | `app/report.tsx`, `app/safety.tsx`, `app/violation/[id].tsx`, `app/account-status.tsx` + `safetyStore`, `ticketsStore` | same — StatusScreen/Banner + Fluent 3D | ✅ |
| 32 | Maintenance / app update | `app/maintenance.tsx`, `app/app-update.tsx` | same — Fluent 3D status | ✅ |
| 33 | Security (PIN + biometric lock) | `app/security.tsx` + `securityStore`, `BiometricLock` | same | ✅ |
| 34 | Provider mode — Today | `app/pro/index.tsx` | same — KPI row, request countdown ring, swipe accept/decline | ✅ |
| 35 | Provider mode — Jobs | `app/pro/jobs/[id].tsx` | same | ✅ |
| 36 | Provider mode — Earnings | `app/pro/earnings.tsx` | same — SVG bar chart (ink/green) | ✅ |
| 37 | Provider onboarding / verification / guidelines / availability | `app/pro/onboarding.tsx`, `app/pro/verification.tsx`, `app/pro/guidelines.tsx`, `app/pro/availability.tsx` | same | ✅ |
| 38 | Customer/Pro mode switch | `app/(tabs)/account.tsx` | same — animated switch (drawer removed) | ➡️ |
| 39 | Coachmarks (first-run) | `coachmarkStore`, `Coachmark` | same — max 3 per screen | ✅ |
| 40 | Offline / toast / undo | `OfflineBanner`, `Toast`, `toastStore`, `toastQueueStore` | same — stacked toasts, swipe, Undo | ✅ |
| 41 | Design-system gallery (dev) | `app/dev/design-system.tsx` | same — v3 token/components gallery | ✅ |

## New v3 behaviours (mock, Expo Go)

| Feature | Location | Event |
|---------|----------|-------|
| 🆕 Add-to-basket "+"→stepper | ServiceCard / Home / Category / Provider | `add_to_basket` |
| 🆕 One-tap rebook + smart slots | Home "Book again", Bookings | `rebook` |
| 🆕 Long-press context menus | ServiceCard / ProCard / booking cards (`ContextMenu`) | `context_menu_action` |
| 🆕 Slide-to-confirm | Checkout | `slide_to_confirm` |
| 🆕 LivePill on every screen during an active booking | `LiveActivityPill` | — |
| 🆕 Pull-to-refresh with logo-mark animation | `LogoRefresh` | — |

## Analytics

Existing events `search`, `view_provider`, `start_booking`, `confirm_booking`,
`cancel_booking` keep firing; v3 adds `add_to_basket`, `rebook`,
`context_menu_action`, `slide_to_confirm`.

## Routes / i18n

No route path removed. No store or mock shape changed. Every new string added to
`en.json`, `hi.json`, `ar.json`. RTL verified for `ar`.
