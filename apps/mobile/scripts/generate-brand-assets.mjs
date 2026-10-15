#!/usr/bin/env node
/**
 * NOVA brand asset generator (dev-only).
 *
 * Rasterises the brand SVG sources in `src/assets/brand` into the PNGs that
 * `app.json` references. Uses `sharp` (a devDependency) — this script is run by
 * hand (`node scripts/generate-brand-assets.mjs`) and is NEVER imported by the
 * app at runtime.
 *
 * Outputs:
 *   assets/icon.png                      1024  app icon (accent + mark)
 *   assets/adaptive-icon.png             1024  Android adaptive foreground
 *   assets/images/android-icon-foreground.png
 *   assets/images/android-icon-monochrome.png
 *   assets/images/android-icon-background.png (solid accent)
 *   assets/splash-icon.png                512  splash mark (transparent)
 *   assets/favicon.png                     48  favicon
 */
import { readFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const brand = join(root, 'src', 'assets', 'brand');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('sharp is required: run `npm i -D sharp` first.');
  process.exit(1);
}

const ACCENT = { r: 0x6d, g: 0x5b, b: 0xff, alpha: 1 };

async function svg(name) {
  return readFile(join(brand, name));
}

async function renderToPng(svgBuffer, size, out, { background } = {}) {
  await mkdir(dirname(out), { recursive: true });
  let img = sharp(svgBuffer, { density: 512 }).resize(size, size, {
    fit: 'contain',
    background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
  });
  if (background) img = img.flatten({ background });
  await img.png().toFile(out);
  console.log('wrote', out);
}

async function solidPng(size, out, color) {
  await mkdir(dirname(out), { recursive: true });
  await sharp({
    create: { width: size, height: size, channels: 4, background: color },
  })
    .png()
    .toFile(out);
  console.log('wrote', out);
}

async function main() {
  const icon = await svg('icon.svg');
  const fg = await svg('adaptive-foreground.svg');
  const mono = await svg('adaptive-monochrome.svg');
  const splash = await svg('splash.svg');

  await renderToPng(icon, 1024, join(root, 'assets', 'icon.png'));
  await renderToPng(icon, 1024, join(root, 'assets', 'adaptive-icon.png'));
  await renderToPng(fg, 1024, join(root, 'assets', 'images', 'android-icon-foreground.png'));
  await renderToPng(mono, 1024, join(root, 'assets', 'images', 'android-icon-monochrome.png'));
  await solidPng(1024, join(root, 'assets', 'images', 'android-icon-background.png'), ACCENT);
  await renderToPng(splash, 512, join(root, 'assets', 'splash-icon.png'));
  await renderToPng(icon, 48, join(root, 'assets', 'favicon.png'));

  console.log('\nBrand assets regenerated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
