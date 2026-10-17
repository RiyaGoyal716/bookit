# UI Audit — Bookit 2.0 "NOVA REDESIGN v3"

Audit of the pre-v3 state (the earlier "Nova" work) that this rebuild replaces.
One row per route → problems found → fix applied in v3. v3 keeps every feature,
store, mock and route; only the presentation layer changes.

## Brand-level problems (apply to every screen)

| Area | Problem (pre-v3) | Fix (v3) |
| --- | --- | --- |
| Accent colour | Single **purple** accent `#6D5BFF` (light) / `#8B7DFF` (dark), plus a purple→lilac gradient. Purple was ~everywhere. | New multi-role palette: **ink** primary actions, **green** success/live/logo, **coral** offers/alerts/hearts, **sunshine** Plus/stars, **sky** links/info/tracking, per-category tints. No purple except the Wellness tint. |
| Typography | Inter (UI) + Inter Tight (titles). | **Bricolage Grotesque** headings, **Plus Jakarta Sans** body/UI. Inter / Inter Tight / Sora removed. |
| Icons | `lucide-react-native` line icons via `<Icon>`. | **phosphor-react-native** only, weight `bold`/`fill`, sizes 16/20/24, through the same single `<Icon>` wrapper. lucide + @expo/vector-icons uninstalled. |
| Illustrations | Hand-drawn single-weight **SVG** line art (`src/assets/illustrations`, `src/assets/icons/categories`). | **Microsoft Fluent Emoji 3D** PNGs (MIT) in `src/assets/3d`, loaded via `expo-image`. No hand-drawn SVG glyphs/illustrations. |
| Logo | Geometric "b" SVG, ink-only, no tick/dot. | Exact green-tick "b" mark + coral notification dot (`src/assets/brand/mark.svg`), wordmark in Bricolage 800. |
| App icon / splash | Adaptive background `#6D5BFF`, splash `#09090B` dark. | Adaptive background `#111315` (ink), splash `#FFFFFF` / `#0E0F11`. |

## Purple / indigo / cyan inventory (every value and where it lived)

| Value | Role | Locations | v3 replacement |
| --- | --- | --- | --- |
| `#6D5BFF` | light accent | `src/theme/colors.ts` (lightTokens.accent, gradient), `app.json` adaptiveIcon bg, `src/assets/brand/icon.svg`, `src/assets/brand/splash.svg`, `__tests__/home.test.tsx`, snapshot | ink `#111315` / role colours |
| `#8B7DFF` | dark accent / gradient stop | `src/theme/colors.ts` (darkTokens.accent, gradients) | ink `#F4F5F7` (dark primary) / role colours |
| `#A99DFF` | gradient stop (Plus) | `src/theme/colors.ts` | sunshine/ink Plus card |
| `#6D5BFF14`, `#8B7DFF1F` | accentSoft | `src/theme/colors.ts` | role soft tokens |
| (none) `#4F46E5`, `#06B6D4` | — | not present in codebase | n/a |
| `#F59E0B` / `#D97706` | warning "amber" (read as near-sunshine) | `src/theme/colors.ts`, `src/components/BarChart.tsx` | token `warning` + `sunshine`/`star` |

Confirmed by grep: purple literals existed only in `colors.ts`, `app.json`, the two
brand raster-source SVGs, `BarChart.tsx`, one test and one snapshot. All other code
reads the purple through `useColors()`/`useTokens()`, so retinting the tokens
re-skins the whole app at once.

## Per-route audit (abridged to the recurring problem → fix)

Every route below consumed the purple accent token and lucide icons; the fix for
all is "re-skins automatically via v3 tokens + Phosphor `<Icon>` + Fluent 3D".
Route-specific notes only where structure changed:

| Route | Route-specific problem | Fix |
| --- | --- | --- |
| `app/(tabs)/index.tsx` (Home) | Purple hero, SVG illos, inline sections | v3 token palette; content-colour sections; Fluent 3D on tiles/bento; order per spec |
| `app/(tabs)/explore.tsx` | purple chips/map | role tints; sky for map/tracking |
| `app/(tabs)/bookings.tsx` | purple status | green=booked, coral=cancelled, sky=tracking |
| `app/(tabs)/inbox.tsx` | purple unread dot | coral alert dot / sky info |
| `app/(tabs)/account.tsx` | purple icon rows, side drawer | coloured `IconChip` rows; drawer items already in Account |
| `app/category/[slug].tsx` | purple hero | per-category tint hero + 3D icon |
| `app/provider/[id].tsx` | purple accents | ink Book bar, sky verified, sunshine rating |
| `app/checkout.tsx` | purple CTA | ink slide-to-confirm, green success |
| `app/plus.tsx` | purple gradient card | ink + sunshine Plus card (one allowed gradient) |
| `app/offers.tsx` | purple offer cards | coral/sky/sunshine soft offer cards |
| `app/success.tsx` | purple tick | green success + Fluent 3D party popper |
| `app/pro/*` | purple KPIs/charts | ink/green KPIs, sky/green chart |
| all status/empty (`maintenance`, `report`, `violation`, `account-status`, `app-update`, `EmptyState`) | SVG illo | Fluent 3D StatusScreen/EmptyState |
| `app/dev/design-system.tsx` | purple swatches | v3 token gallery |

## Verification gates (unchanged, hardened)

`npm run check:design` now also fails on any purple/indigo/cyan literal and on any
phosphor import outside the `<Icon>` wrapper, in addition to the existing hex /
fontSize / raw-Text / emoji / old-asset rules.
