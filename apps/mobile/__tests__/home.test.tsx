import { render } from '@testing-library/react-native';

import { Badge } from '../src/components/Badge';
import { colors, spacing } from '../src/theme';

describe('Badge', () => {
  it('renders its status label', async () => {
    const { getByText } = await render(<Badge status="Requested" />);
    expect(getByText('Requested')).toBeTruthy();
  });
});

describe('theme tokens', () => {
  it('exposes the teal brand primary colour', () => {
    expect(colors.brand.primary).toBe('#0F766E');
  });

  it('uses a 4pt spacing base', () => {
    expect(spacing.xs).toBe(4);
  });
});
