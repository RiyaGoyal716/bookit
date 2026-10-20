#!/usr/bin/env node
/**
 * DEV-ONLY asset downloader. Fetches the Microsoft Fluent Emoji 3D PNGs (MIT)
 * used by Bookit into src/assets/3d/. Never imported by the app.
 *
 *   node scripts/download-3d.mjs
 *
 * Each entry is [<Folder display name>, <file stem>]. The download URL is
 *   https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/<Folder>/3D/<stem>_3d.png
 * with spaces in <Folder> URL-encoded. The saved filename is <stem>.png, except
 * where noted so it matches the key used in src/assets/3d/index.tsx.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', '3d');
const BASE = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets';

/** [folder, stem, savedAs?] */
const PAIRS = [
  ['Sponge', 'sponge'],
  ['Bucket', 'bucket'],
  ['Lipstick', 'lipstick'],
  ['Barber pole', 'barber_pole'],
  ['Scissors', 'scissors'],
  ['Books', 'books'],
  ['Graduation cap', 'graduation_cap'],
  ['Hammer and wrench', 'hammer_and_wrench'],
  ['Toolbox', 'toolbox'],
  ['Plunger', 'plunger'],
  ['High voltage', 'high_voltage'],
  ['Light bulb', 'light_bulb'],
  ['Delivery truck', 'delivery_truck'],
  ['Package', 'package'],
  ['Dog face', 'dog_face'],
  ['Paw prints', 'paw_prints'],
  ['Potted plant', 'potted_plant'],
  ['Herb', 'herb'],
  ['Lotion bottle', 'lotion_bottle'],
  ['Bathtub', 'bathtub'],
  ['Broom', 'broom'],
  ['House', 'house'],
  ['Fire', 'fire'],
  ['Wrapped gift', 'wrapped_gift'],
  ['Crown', 'crown'],
  ['Stopwatch', 'stopwatch'],
  ['Shield', 'shield'],
  ['Spiral calendar', 'spiral_calendar'],
  ['Magnifying glass tilted left', 'magnifying_glass_tilted_left'],
  ['Bell', 'bell'],
  ['Speech balloon', 'speech_balloon'],
  ['Party popper', 'party_popper'],
  ['Credit card', 'credit_card'],
  ['Round pushpin', 'round_pushpin'],
  ['Locked', 'locked'],
  ['Money bag', 'money_bag'],
  ['Star', 'star'],
  ['Warning', 'warning'],
  ['Globe showing Europe-Africa', 'globe_showing_europe-africa'],
  ['Mobile phone', 'mobile_phone'],
  ['Hourglass not done', 'hourglass_not_done'],
  ['Construction', 'construction'],
  // --- Icon system v2 (PROMPT 8): new 3D glyphs for account rows, quick tiles,
  // notification types, settings, safety, wallet, empty / status screens. ---
  ['Coin', 'coin'],
  ['Red heart', 'red_heart'],
  ['Briefcase', 'briefcase'],
  ['Bell with slash', 'bell_with_slash'],
  ['Page facing up', 'page_facing_up'],
  ['Gear', 'gear'],
  ['Balance scale', 'balance_scale'],
  ['Door', 'door'],
  ['Check mark button', 'check_mark_button'],
  ['Alarm clock', 'alarm_clock'],
  ['Admission tickets', 'admission_tickets'],
  ['Glowing star', 'glowing_star'],
  ['Locked with key', 'locked_with_key'],
  ['Motor scooter', 'motor_scooter'],
  ['Cross mark', 'cross_mark'],
  ['Megaphone', 'megaphone'],
  ['Identification card', 'identification_card'],
  ['Police car light', 'police_car_light'],
  ['Handshake', 'handshake'],
  ['Crescent moon', 'crescent_moon'],
  ['Key', 'key'],
  ['Chart increasing', 'chart_increasing'],
  ['World map', 'world_map'],
];

async function main() {
  await mkdir(OUT, { recursive: true });
  let ok = 0;
  let fail = 0;
  let skip = 0;
  for (const [folder, stem, savedAs] of PAIRS) {
    const dest = join(OUT, `${savedAs ?? stem}.png`);
    if (existsSync(dest)) {
      skip += 1;
      continue;
    }
    const url = `${BASE}/${encodeURIComponent(folder)}/3D/${stem}_3d.png`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = new Uint8Array(await res.arrayBuffer());
      await writeFile(dest, buf);
      ok += 1;
      console.log(`  ok   ${stem}.png`);
    } catch (e) {
      fail += 1;
      console.error(`  FAIL ${stem}  (${url})  ${e.message}`);
    }
  }
  console.log(`\nFluent 3D download — ${ok} ok, ${skip} skipped, ${fail} failed, into ${OUT}`);
  if (fail) process.exit(1);
}

main();
