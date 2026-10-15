import Animated, { FadeInDown, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { duration, listStagger } from '../../theme';

export interface AnimatedListItemProps {
  index: number;
  children: React.ReactNode;
}

/**
 * Staggered fade-up entrance for list items on first load only (40ms stagger,
 * capped), plus LinearTransition for add/remove. No animation under Reduce
 * Motion. Animates transform/opacity only (UI thread, 60fps-safe).
 */
export function AnimatedListItem({ index, children }: AnimatedListItemProps) {
  const reduced = useReducedMotion();
  if (reduced) return <Animated.View>{children}</Animated.View>;
  const delay = Math.min(index, listStagger.max) * listStagger.step;
  return (
    <Animated.View
      entering={FadeInDown.duration(duration.slow).delay(delay)}
      layout={LinearTransition.duration(duration.base)}
    >
      {children}
    </Animated.View>
  );
}
