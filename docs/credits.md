# Credits & Licences

Bookit uses the following open-source assets. These are also surfaced in-app under
**Settings › About › Licences**.

## Illustrations — Microsoft Fluent Emoji (3D)

- **Source:** https://github.com/microsoft/fluentui-emoji
- **Licence:** MIT © Microsoft Corporation
- **Use in Bookit:** the 3D PNGs in `apps/mobile/src/assets/3d/` are the app's only
  colour-illustration system — category tiles, the "Today's picks" bento, offers,
  empty/error/status screens, onboarding and permission primers. They are loaded as
  static assets through `expo-image` (`src/assets/3d/index.tsx` → `Fluent3D`). Files
  were fetched with the dev-only downloader (see below) from
  `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Folder>/3D/<file>_3d.png`.

MIT licence text: https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE

## Icons — Phosphor

- **Source:** https://github.com/phosphor-icons/react-native (`phosphor-react-native`)
- **Licence:** MIT © Phosphor Icons
- **Use in Bookit:** every UI glyph, through the single `<Icon>` wrapper
  (`src/components/ui/Icon.tsx`), weights `bold` (default) / `fill` (active/selected).

## Typefaces

- **Bricolage Grotesque** — SIL Open Font License 1.1 (headings).
- **Plus Jakarta Sans** — SIL Open Font License 1.1 (body / UI).
  Both via `@expo-google-fonts/*`.

## Notes

- `apps/mobile/scripts/download-3d.mjs` is a **dev-only** downloader (Node + fetch);
  it is never imported by the app and nothing in `src/assets/3d/` is executed — the
  folder holds image assets only.
- No other app's colours, illustrations, copy or icon set is used.
