# Bookit — Project Handover & Context

> Paste this into a new Claude chat to give it full context, or let a Claude Code session in this repo read it. It captures everything built so far, the conventions to follow, and how to run the app.

## 1. What Bookit is
A two-sided **hyperlocal services marketplace** mobile app (in the style of Urban Company / Fresha / TaskRabbit). Customers find, book and pay **verified local providers** (cleaning, barber & beauty, tutoring); providers get a "pro" side to manage jobs and earnings. Launch city **Leeds**; designed to scale globally (UK, India, UAE, US, Australia). Platform fee **12%**.

**Status:** a complete **front-end prototype** with **mock data**, running on a real phone via **Expo Go**. No real backend or live payments yet.

## 2. Where everything is
- **Local repo:** `C:\Users\CPIN\bookit` — the Expo app is in **`apps/mobile`**, docs in **`/docs`**.
- **GitHub:** `github.com/RiyaGoyal716/bookit` (owner account: RiyaGoyal716).
- **Git identity:** repo-local author is **RiyaGoyal716** `<RiyaGoyal716@users.noreply.github.com>` (do not change). Commits end with a `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` line. `gh` CLI is **not installed**, so PRs are opened via GitHub "compare" URLs.
- **Branches** — each is a feature, pushed and PR'd to `main` (not yet merged). Built in this order: `main` → `feat/demo-mock-flow` → `feat/ui-polish` → `feat/phone-intl-and-features` → `feat/discovery-ux` → `feat/aurora-redesign` → `feat/aurora-full-app` (current/latest).

## 3. Tech stack
Expo **SDK 57**, React Native 0.86, **TypeScript (strict)**, **Expo Router**, **Zustand** (state), **TanStack Query**, **i18n-js** (en/hi/ar + RTL), **react-native-reanimated 4 + moti** (animation), **@gorhom/bottom-sheet**, **@shopify/flash-list**, **expo-image**, **expo-blur**, **expo-linear-gradient**, **react-native-svg**, **lucide-react-native** + @expo/vector-icons (icons), **@expo-google-fonts** Sora + Inter, **libphonenumber-js**, expo-localization / expo-location / expo-network / expo-image-picker / expo-haptics, @sentry/react-native (no-op without DSN).

## 4. Conventions (IMPORTANT — follow these)
- **Theme:** use the `useColors()` / `useTheme()` hook (light + dark **bespoke** palettes — dark is not an inversion), `typography.scale.*`, and `spacing`/`radius` tokens from `src/theme`. **No hard-coded hex colours or raw `fontSize` in screens.** Dark mode must work on every screen.
- **i18n:** use `useT()` (translate), `useMoney()` (currency), `useDirection()` / `useDirectionalStyles()` (RTL). **Language is DECOUPLED from region** — default English; the user picks language in Settings (English / हिंदी / العربية). Region sets only currency + dial code. Arabic → RTL is **component-level** (NOT `I18nManager.forceRTL`, which is unreliable in Expo Go).
- **Lists:** `@shopify/flash-list` everywhere. **Images:** `expo-image` with a placeholder + `cachePolicy`.
- **State:** session-only **Zustand** stores (mock, no persistence) in `src/stores`. Mock data in `src/mocks`.
- **Prices** always go through `useMoney()`.

## 5. HARD CONSTRAINT — Expo Go compatibility
The app must run in Expo Go with **no red screen**. Therefore:
- **Never import** `react-native-mmkv`, `react-native-maps`, `react-native-nitro-modules`, or `src/lib/storage.ts` in the runtime graph. (`storage.ts` uses MMKV and is intentionally unused.)
- Maps / live tracking / charts are **SVG placeholders** (no native maps), e.g. `MapPlaceholder`, `RouteMapTracker`, `BarChart`.
- **Do not add new native deps** without checking Expo Go support — install with `npx expo install <pkg>` so versions match the SDK.

## 6. Quality gates (all must pass before committing)
Run from `apps/mobile`:
- `npm run lint` → 0 ; `npm run typecheck` → 0 ; `npm test` → passing (**52 tests, 8 suites**, incl. 3 snapshots) ; `npx expo export --platform android` → no errors ("no red screen" gate).
- A **Husky pre-commit hook** runs lint + typecheck on every commit. **GitHub Actions CI** runs lint/typecheck/test on every PR.

## 7. What was built (the executed plan, branch by branch)
1. **`main`** — `/docs`: PRD, booking state machine, architecture, data model, decisions log. Expo app **scaffold** (TS, Expo Router, ESLint/Prettier, Jest, Husky, EAS config, CI, dev-client).
2. **`feat/demo-mock-flow`** — customer demo flow: Welcome → Login → OTP → tabs (Home/Bookings/Profile) → provider → booking → success → bookings → logout. Mock data (12 Leeds providers), Zustand auth + bookings stores, first tests.
3. **`feat/ui-polish`** — production UI: branding (SVG logo, generated app icons/splash), **Sora + Inter** fonts, theme + **dark mode**, polished components (Button/Input/Card/Chip/Badge/Avatar/RatingStars/Skeleton/EmptyState/BottomSheet), snapshot tests.
4. **`feat/phone-intl-and-features`** — **international phone input** (libphonenumber-js, searchable country picker — later fixed to a reliable RN `Modal`) + 15 features: favourites, search, sort/filter sheet, availability, reviews + write-review, booking cancel/reschedule + detail + status timeline, notifications, promo code (BOOKIT10), address book, onboarding, settings (theme override), help, share, offline banner, error boundary.
5. **`feat/discovery-ux`** — Urban-Company-style rebuild: rich **home** (rails, hero carousel, full-screen search), **category pages**, **rich provider profile** (gallery, reviews, compare up to 3), **cart & checkout** (confetti success), **4-tab nav** + side drawer.
6. **`feat/aurora-redesign`** — **"Bookit Aurora"** global redesign: indigo→cyan theme, Sora+Inter scale, **i18n (en/hi/ar + RTL)**, animated **opening** (self-drawing splash, intro slides, region chooser, auth, permission primers), home with **AI concierge chat**, **instant estimate**, **post-a-job** → offers. Then **language decoupled from region** (default English; language picker in Settings).
7. **`feat/aurora-full-app`** (current) — full build-out: enriched discovery/provider (packages, add-ons, before/after, compare), booking & payments (recurring, wallet, Apple/Google Pay mock), **bookings + live tracking** (animated route) + chat/inbox + support bot, account (wallet & transactions, **Bookit Plus**, security PIN/biometric mock), **provider mode** ("Become a pro": onboarding, dashboard, job requests, earnings), **trust/safety/policy** (Terms, Privacy, Cancellation, Community, Safety, Pro Standards, Cookie + report/ticket system + account-status/appeal + safety centre), **motion polish** (moti: shimmer, animated tab bar, heart pop, timeline reveal), docs + README update.

## 8. Known partial items
- **RTL** is component-level, not native — some **older/legacy screens still render LTR** in Arabic.
- **Translated strings** cover the new screens; some legacy screens keep English literals (they still pick up Aurora theme/fonts).
- **Onboarding** gate is a session flag (in-memory) — the opening flow shows each launch.

## 9. How to run on a phone (Expo Go)
From `apps/mobile`: `npx expo start --go` (add `-c` after dependency changes).
- **USB (most reliable):** connect phone + enable USB debugging, then `adb reverse tcp:8081 tcp:8081`, and in Expo Go open `exp://localhost:8081`. (adb is at `%LOCALAPPDATA%\Android\Sdk\platform-tools`.)
- **LAN:** phone + PC on the same Wi-Fi + a Windows Firewall inbound allow rule for TCP 8081, then `exp://<PC-LAN-IP>:8081`.
- **Tunnel:** `npx expo start --go --tunnel` (works without same network, but the large bundle sometimes needs a couple of reloads).
- Local native build needs `JAVA_HOME` = the Adoptium **JDK 25** install; Android SDK at `%LOCALAPPDATA%\Android\Sdk`.

## 10. Suggested next steps
- Merge the feature-branch PRs into `main`.
- Build the **backend** per `docs/architecture.md`: NestJS + PostgreSQL (PostGIS) + Redis + Cloudflare R2, Stripe + Stripe Connect; multi-tenant via `channel_id` + RLS.
- Replace mock Zustand stores with API calls (TanStack Query is already wired).
- Full i18n string sweep across legacy screens; proper native RTL via a development build.
- EAS build for installable APK / store submission.
