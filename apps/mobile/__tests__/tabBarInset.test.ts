import {
  tabBarInset,
  TAB_BAR_HEIGHT,
  TAB_BAR_BOTTOM_GAP,
  TAB_BAR_CONTENT_GAP,
} from '../src/components/ui/tabBarMetrics';

describe('tabBarInset', () => {
  it('adds the bar height, the safe-area inset and the content gap', () => {
    expect(tabBarInset(0)).toBe(TAB_BAR_HEIGHT + TAB_BAR_CONTENT_GAP);
    expect(tabBarInset(34)).toBe(TAB_BAR_HEIGHT + 34 + TAB_BAR_CONTENT_GAP);
  });

  it('is monotonic in the safe-area inset', () => {
    expect(tabBarInset(20)).toBeGreaterThan(tabBarInset(0));
    expect(tabBarInset(48)).toBeGreaterThan(tabBarInset(20));
  });

  it('exposes sane layout constants', () => {
    expect(TAB_BAR_HEIGHT).toBe(64);
    expect(TAB_BAR_BOTTOM_GAP).toBe(8);
    expect(TAB_BAR_CONTENT_GAP).toBe(24);
  });
});
