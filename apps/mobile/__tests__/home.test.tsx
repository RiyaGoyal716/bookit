import { render } from '@testing-library/react-native';

import { StatusPill } from '../src/components/ui/StatusPill';
import { colors, spacing } from '../src/theme';

describe('StatusPill', () => {
  it('renders its status label', async () => {
    const { getByText } = await render(<StatusPill label="Requested" tone="info" />);
    expect(getByText('Requested')).toBeTruthy();
  });
});

describe('theme tokens', () => {
  it('exposes the v3 ink primary colour (green is success/logo only)', () => {
    expect(colors.nova.primary).toBe('#111315');
    expect(colors.nova.success).toBe('#0B7F48');
    expect(colors.nova.brandGreen).toBe('#12B76A');
  });

  it('exposes the v3 content colours (coral / sunshine / sky)', () => {
    expect(colors.nova.coral).toBe('#FF5A36');
    expect(colors.nova.sunshine).toBe('#FFC83D');
    expect(colors.nova.sky).toBe('#1570EF');
  });

  it('uses a 4pt spacing base', () => {
    expect(spacing.xs).toBe(4);
  });
});
