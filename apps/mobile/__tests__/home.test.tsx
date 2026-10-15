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
