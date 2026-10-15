#!/usr/bin/env node
/**
 * NOVA design-system linter (`npm run check:design`, also run from `npm run lint`).
 *
 * Enforces the NOVA conventions across the WHOLE app — every file under app/ and
 * src/ (no ratchet, no allowlist). It fails (exit 1) on:
 *   - hex / rgb colours outside src/theme and src/brand
 *   - numeric fontSize outside src/theme
 *   - raw `Text` / `TouchableOpacity` imported from react-native (use ui <Text> / Pressable)
 *   - emoji in source
 *   - icon imports not through the <Icon> wrapper (lucide / @expo/vector-icons)
 *   - references to removed Aurora logo/gradient assets
 *
 * The only exceptions are principled, not a ratchet:
 *   - src/theme/**      — defines the colour + type tokens (hex / fontSize live here)
 *   - src/brand/**      — the one-colour brand assets (own palette, own <Text>)
 *   - src/components/ui/Icon.tsx  — the single lucide import point
 *   - src/components/ui/Text.tsx  — the single raw react-native Text wrapper
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '..', '..');

/** The whole app is scanned — the entire app/ and src/ trees. */
const SCAN_DIRS = ['app', 'src'];
const SCAN_FILES = [];

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const RGB = /\brgba?\(/g;
const ALLOWED_HEX = new Set(['#fff', '#ffffff', '#000', '#000000']);
const EMOJI =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/u;
const OLD_ASSETS = /(logo\.svg|logo-glow|AuroraBackground|GradientButton|tabIcons)/;

const violations = [];

function add(file, line, rule, text) {
  violations.push({ file, line, rule, text: text.trim().slice(0, 80) });
}

function rnImports(src) {
  // collect identifiers imported from 'react-native'
  const out = new Set();
  const re = /import\s*\{([^}]*)\}\s*from\s*['"]react-native['"]/g;
  let m;
  while ((m = re.exec(src))) {
    m[1]
      .split(',')
      .map((s) =>
        s
          .trim()
          .split(/\s+as\s+/)[0]
          .trim(),
      )
      .filter(Boolean)
      .forEach((id) => out.add(id));
  }
  return out;
}

function checkFile(abs) {
  const rel = relative(root, abs).replace(/\\/g, '/');
  const src = readFileSync(abs, 'utf8');
  const lines = src.split('\n');
  const inTheme = rel.startsWith('src/theme/');
  const inBrand = rel.startsWith('src/brand/');
  const isIconWrapper = rel.endsWith('src/components/ui/Icon.tsx');
  const isTextPrimitive = rel.endsWith('src/components/ui/Text.tsx');

  // Import-level checks
  if (!isIconWrapper) {
    if (/from\s+['"]lucide-react-native['"]/.test(src))
      add(rel, 0, 'icon-import', 'imports lucide directly (use <Icon>)');
    if (/from\s+['"]@expo\/vector-icons['"]/.test(src))
      add(rel, 0, 'icon-import', 'imports @expo/vector-icons (use <Icon>)');
  }
  if (!isTextPrimitive && !inBrand) {
    const rn = rnImports(src);
    if (rn.has('Text')) add(rel, 0, 'raw-text', 'imports Text from react-native (use ui <Text>)');
    if (rn.has('TouchableOpacity'))
      add(rel, 0, 'touchable', 'imports TouchableOpacity (use PressableScale)');
  }

  lines.forEach((ln, i) => {
    const n = i + 1;
    const code = ln.replace(/\/\/.*$/, '');
    if (!inTheme && !inBrand) {
      const hexes = code.match(HEX);
      if (hexes && hexes.some((h) => !ALLOWED_HEX.has(h.toLowerCase())))
        add(rel, n, 'hex-color', ln);
      if (RGB.test(code)) add(rel, n, 'rgb-color', ln);
    }
    if (!inTheme && /fontSize:\s*\d/.test(code)) add(rel, n, 'font-size', ln);
    if (EMOJI.test(ln)) add(rel, n, 'emoji', ln);
    if (OLD_ASSETS.test(ln)) add(rel, n, 'old-asset', ln);
  });
}

function walk(dir) {
  const abs = join(root, dir);
  let entries;
  try {
    entries = readdirSync(abs);
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(abs, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(relative(root, p));
    else if (['.ts', '.tsx'].includes(extname(p))) checkFile(p);
  }
}

SCAN_DIRS.forEach(walk);
SCAN_FILES.forEach((f) => {
  try {
    checkFile(join(root, f));
  } catch {
    /* file may not exist yet */
  }
});

if (violations.length) {
  console.error(`\ncheck:design — ${violations.length} violation(s):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  [${v.rule}]  ${v.text}`);
  }
  console.error('');
  process.exit(1);
}

console.log('check:design — OK (NOVA rules clean across the whole app/ and src/)');
