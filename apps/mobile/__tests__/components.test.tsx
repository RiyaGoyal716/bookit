import { render } from '@testing-library/react-native';

import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { Badge } from '../src/components/Badge';

describe('Button', () => {
  it('renders a primary button and matches snapshot', async () => {
    const { toJSON } = await render(<Button label="Continue" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders a disabled ghost button', async () => {
    const { getByText } = await render(<Button label="Skip" variant="ghost" disabled />);
    expect(getByText('Skip')).toBeTruthy();
  });
});

describe('Input', () => {
  it('renders a labelled field with an error and matches snapshot', async () => {
    const { toJSON } = await render(
      <Input label="Mobile number" value="123" error="Too short" placeholder="Phone" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('Badge', () => {
  it('renders each status and matches snapshot', async () => {
    const { toJSON } = await render(
      <>
        <Badge status="Requested" />
        <Badge status="Accepted" />
        <Badge status="Completed" />
      </>,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
