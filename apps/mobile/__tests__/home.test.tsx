import { render } from '@testing-library/react-native';

import HomeScreen from '../app/index';
import { colors, spacing } from '../src/theme';

describe('HomeScreen', () => {
  it('renders the Bookit title', async () => {
    const { getByText } = await render(<HomeScreen />);
    expect(getByText('Bookit')).toBeTruthy();
  });
});

describe('theme tokens', () => {
  it('exposes the brand primary colour', () => {
    expect(colors.brand.primary).toBe('#208AEF');
  });

  it('uses a 4pt spacing base', () => {
    expect(spacing.xs).toBe(4);
  });
});
