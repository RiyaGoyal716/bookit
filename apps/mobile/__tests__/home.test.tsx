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
  it('exposes the Aurora electric-indigo brand primary colour', () => {
    expect(colors.brand.primary).toBe('#4F46E5');
  });

  it('exposes the signature indigo→cyan gradient', () => {
    expect(colors.brand.gradient).toEqual(['#4F46E5', '#06B6D4']);
  });

  it('uses a 4pt spacing base', () => {
    expect(spacing.xs).toBe(4);
  });
});
