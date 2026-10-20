/**
 * Pure tab-bar layout metrics — no reanimated / native imports, so these are
 * safe to unit-test and to import from anywhere.
 */

/** Floating tab bar island height (pt). */
export const TAB_BAR_HEIGHT = 64;
/** Gap between the island and the safe-area bottom edge. */
export const TAB_BAR_BOTTOM_GAP = 8;
/** Extra breathing room above the bar for scroll content. */
export const TAB_BAR_CONTENT_GAP = 24;

/**
 * The bottom padding every tab screen's scroll content needs so nothing hides
 * behind the floating bar: bar height + bottom safe-area inset + content gap.
 */
export function tabBarInset(bottomSafeArea: number): number {
  return TAB_BAR_HEIGHT + bottomSafeArea + TAB_BAR_CONTENT_GAP;
}
