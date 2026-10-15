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
  it('exposes the NOVA ink primary colour', () => {
    expect(colors.nova.primary).toBe('#0A0A0F');
  });

  it('exposes the single NOVA accent colour', () => {
    expect(colors.nova.accent).toBe('#6D5BFF');
  });

  it('uses a 4pt spacing base', () => {
    expect(spacing.xs).toBe(4);
  });
});
