# NOVA redesign — UI audit (Phase 0)

> Audit of the existing **Aurora** presentation layer ahead of the **NOVA** rebuild.
> Scope: visual/UX only. All features, stores, mock data, i18n, routes and business
> logic are preserved — this replaces the presentation layer.

## Method

Evidence gathered by static inspection of `app/` (57 route files, ~15.6k LOC) and
`src/components` (~3.4k LOC):

- Icons: `@expo/vector-icons` (`Ionicons`) used in **63 files** — the dominant icon
  system. `lucide-react-native` used in only 8 files. Mixed icon systems.
- `TouchableOpacity`: 0 occurrences (good — app already uses `Pressable`).
- Emoji in UI strings: 0 occurrences (good).
- Stray hex/rgb outside `src/theme`: 3 files (`AuroraBackground`, `GradientButton`,
  `HeroCarousel` — all Aurora gradient components, to be removed).
- Fonts: **Sora** (display) + Inter (body). Sora referenced in `app/_layout.tsx` and
  `src/theme/typography.ts`.
- Aurora gradient surfaces: `AuroraBackground`, `GradientButton`, `HeroCarousel`
  referenced by `app/(tabs)/index.tsx`, `app/index.tsx`, `login`, `offers`,
  `onboarding`, `otp`, `permissions`, `post-job`, `region`.
- Old logo: `src/components/Logo.tsx` + `src/assets/logo.svg`, referenced by
  `app-update`, `invoice/[id]`, `maintenance`.
- Tabs: only 4 (Home, Bookings, Inbox, Account) — NOVA requires 5 (adds Explore) and a
  Pro-mode swap.

## Cross-cutting problems → planned fix

| Problem | Where | Planned NOVA fix |
| --- | --- | --- |
| Two icon systems (Ionicons + lucide) | 63 + 8 files | Single `<Icon>` wrapper over `lucide-react-native`, stroke 1.75, sizes 16/20/24. Remove `@expo/vector-icons`. |
| Sora display font | `_layout`, `typography` | Inter Tight 600/700 for titles; Inter for UI. Remove Sora. |
| Aurora indigo→cyan gradient everywhere | 3 gradient components + 9 screens | Neutral surfaces + one accent (`#6D5BFF`). Gradient only for app icon + Bookit Plus. |
| Nested palette (`brand.*`, `text.*`) | theme | Flat semantic tokens (bg, surface, text, primary, accent, …); legacy keys kept as back-compat aliases repointed to NOVA values so every screen re-skins at once. |
| Shadows used for depth | `shadow.card/glow` | Depth from hairline borders + layered surfaces; one soft shadow level for floating only. |
| 8pt radius scale, values up to 24 | `spacing.ts` | xs6/sm10/md14/lg20/pill; nothing above 20 except pills. |
| 4-tab IA, no Explore, no Pro swap | `(tabs)` | 5 tabs + animated Pro-mode swap; FloatingTabBar (blurred, active pill). |
| Old logo mark | Logo.tsx, logo.svg | New geometric "b" mark + wordmark in `src/brand`; regenerate app/adaptive/splash/favicon. |

## Per-area screen audit

### Auth & onboarding — `index`, `onboarding`, `region`, `login`, `otp`, `permissions`, `consent`
- Problems: Aurora gradient backgrounds; Ionicons; long multi-step onboarding; hard-coded hero art.
- Fix: neutral surfaces, new brand mark on auth; 2-slide onboarding + "what do you need help with?" multi-select; new line illustrations for permissions.

### Tabs — `(tabs)/index` (Home), `bookings`, `inbox`, `account`
- Home problems: many stacked sections (trust strip, referral card, membership card, floating Post-a-job FAB) → cluttered; gradient hero carousel; Ionicons; duplicate entry points.
- Home fix: 6 blocks max — collapsing header + location pill + bell; one smart search bar (concierge); live "Your booking" card; 2-row paged category grid (72pt tiles); max two rails; one "For you" carousel. Remove trust strip / referral / membership / FAB.
- Bookings fix: segmented Upcoming/Past/Cancelled, swipe actions, compact detail with timeline.
- Inbox/Account fix: inset grouped lists, FlashList, new Icon.

### Discovery — `search`, `concierge`, `category/[slug]`, `compare`, `favourites`, `offers`
- Problems: gradient surfaces, mixed icons, inconsistent card radius/shadow.
- Fix: concierge = full-screen smart search (NL parse → filter chips); Explore list/map toggle (SVG map placeholder) + compare tray; new category duotone icons.

### Provider & booking — `provider/[id]`, `booking/[providerId]`, `booking-detail/[id]`, `cart`, `checkout`, `tracking`, `review`, `invoice`
- Problems: tall provider profile with duplicate sections; multi-screen checkout; gradient CTAs.
- Fix: provider profile compact gallery hero + collapsing blurred header, stats row, chip badges, tabs (Services/Reviews/About/Work), sticky Book bar. Checkout = one sheet flow (collapsible steps), live animated total, slide-to-confirm, confetti only here. Tracking = Live-Activity pill.

### Account & settings — `account`, `settings`, `profile`, `payments`, `wallet`, `addresses`, `security`, `notification-preferences`, `region`, `referrals`, `plus`, `help`, `legal`, `policies`
- Problems: flat long lists, mixed row heights, Ionicons, hard-coded spacing in places.
- Fix: InsetGroupedList (iOS settings style), consistent 56/68 rows, new Icon, biometric lock + global haptics switch in Settings, design-system screen via long-press on version.

### Pro mode — `pro/*`
- Problems: separate visual language.
- Fix: Today (KPI row, next job, countdown-ring request cards, swipe accept/decline), Jobs, Earnings (animated SVG bar chart + payouts); animated mode switch in Account.

### Status / notices — `account-status`, `violation/*`, `maintenance`, `app-update`, `report`, `safety`, `notifications`, `notification-preferences`
- Problems: inconsistent copy/layout across notice types; old Logo on maintenance/update.
- Fix: unified `Banner` + `StatusScreen` templates (violation/warning/under-review/restricted/maintenance/update/offline/payment-failed); new brand mark.

## Asset inventory to remove / regenerate

| Asset | Status |
| --- | --- |
| `src/assets/logo.svg`, `src/components/Logo.tsx` (old) | Replace with new brand mark/wordmark |
| `assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png` | Regenerate from new mark via `scripts/generate-brand-assets.mjs` |
| `assets/images/android-icon-foreground/background/monochrome.png` | Regenerate (new mark + monochrome layer) |
| `assets/images/logo-glow.png`, `tabIcons/*` | Remove (Aurora artefacts) |
| `src/components/AuroraBackground.tsx`, `GradientButton.tsx`, `HeroCarousel.tsx` | Remove (Aurora gradient) |
| Sora font registration | Remove |

_After-state is appended in Phase 7._
