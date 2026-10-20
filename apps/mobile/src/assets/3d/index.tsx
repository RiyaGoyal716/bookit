import { Image, type ImageProps } from 'expo-image';

/**
 * Microsoft Fluent Emoji 3D illustrations (MIT licence — see docs/credits.md and
 * Settings › About › Licences). These PNGs are the app's only colour illustration
 * system: category tiles, top tabs, banners, empty / status screens, onboarding
 * and permission primers. UI glyphs use <Icon> (Phosphor) instead.
 *
 * Downloaded via curl from the fluentui-emoji repo; never run any code from this
 * folder — these are image assets only.
 */
const ART = {
  sponge: require('./sponge.png'),
  bucket: require('./bucket.png'),
  lipstick: require('./lipstick.png'),
  barber_pole: require('./barber_pole.png'),
  scissors: require('./scissors.png'),
  books: require('./books.png'),
  graduation_cap: require('./graduation_cap.png'),
  hammer_and_wrench: require('./hammer_and_wrench.png'),
  toolbox: require('./toolbox.png'),
  plunger: require('./plunger.png'),
  high_voltage: require('./high_voltage.png'),
  light_bulb: require('./light_bulb.png'),
  delivery_truck: require('./delivery_truck.png'),
  package: require('./package.png'),
  dog_face: require('./dog_face.png'),
  paw_prints: require('./paw_prints.png'),
  potted_plant: require('./potted_plant.png'),
  herb: require('./herb.png'),
  lotion_bottle: require('./lotion_bottle.png'),
  bathtub: require('./bathtub.png'),
  broom: require('./broom.png'),
  house: require('./house.png'),
  fire: require('./fire.png'),
  wrapped_gift: require('./wrapped_gift.png'),
  crown: require('./crown.png'),
  stopwatch: require('./stopwatch.png'),
  shield: require('./shield.png'),
  spiral_calendar: require('./spiral_calendar.png'),
  magnifying_glass_tilted_left: require('./magnifying_glass_tilted_left.png'),
  bell: require('./bell.png'),
  speech_balloon: require('./speech_balloon.png'),
  party_popper: require('./party_popper.png'),
  credit_card: require('./credit_card.png'),
  round_pushpin: require('./round_pushpin.png'),
  locked: require('./locked.png'),
  money_bag: require('./money_bag.png'),
  star: require('./star.png'),
  warning: require('./warning.png'),
  globe: require('./globe_showing_europe-africa.png'),
  mobile_phone: require('./mobile_phone.png'),
  hourglass: require('./hourglass_not_done.png'),
  construction: require('./construction.png'),
  // Icon system v2 (PROMPT 8).
  coin: require('./coin.png'),
  red_heart: require('./red_heart.png'),
  briefcase: require('./briefcase.png'),
  bell_with_slash: require('./bell_with_slash.png'),
  page_facing_up: require('./page_facing_up.png'),
  gear: require('./gear.png'),
  balance_scale: require('./balance_scale.png'),
  door: require('./door.png'),
  check_mark_button: require('./check_mark_button.png'),
  alarm_clock: require('./alarm_clock.png'),
  admission_tickets: require('./admission_tickets.png'),
  glowing_star: require('./glowing_star.png'),
  locked_with_key: require('./locked_with_key.png'),
  motor_scooter: require('./motor_scooter.png'),
  cross_mark: require('./cross_mark.png'),
  megaphone: require('./megaphone.png'),
  identification_card: require('./identification_card.png'),
  police_car_light: require('./police_car_light.png'),
  handshake: require('./handshake.png'),
  crescent_moon: require('./crescent_moon.png'),
  key: require('./key.png'),
  chart_increasing: require('./chart_increasing.png'),
  world_map: require('./world_map.png'),
} as const;

export type Fluent3DKey = keyof typeof ART;

export interface Fluent3DProps extends Omit<ImageProps, 'source'> {
  name: Fluent3DKey;
  /** Rendered square size in px. Default 56. */
  size?: number;
}

/** A Fluent 3D emoji rendered through expo-image. */
export function Fluent3D({ name, size = 56, style, ...rest }: Fluent3DProps) {
  return (
    <Image
      source={ART[name]}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      transition={150}
      accessibilityIgnoresInvertColors
      {...rest}
    />
  );
}

/** Raw require() handle for a Fluent 3D asset (for expo-image source props). */
export function fluent3DSource(name: Fluent3DKey) {
  return ART[name];
}
