import { render } from '@testing-library/react-native';

import { StatusPill } from '../src/components/ui/StatusPill';
import { Rating } from '../src/components/ui/Rating';
import { Avatar } from '../src/components/ui/Avatar';

describe('StatusPill', () => {
  it('renders each status and matches snapshot', async () => {
    const { toJSON } = await render(
      <>
        <StatusPill label="Requested" tone="info" />
        <StatusPill label="Accepted" tone="accent" />
        <StatusPill label="Completed" tone="success" />
      </>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders its label', async () => {
    const { getByText } = await render(<StatusPill label="On the way" tone="warning" />);
    expect(getByText('On the way')).toBeTruthy();
  });
});

describe('Rating', () => {
  it('renders a value with a review count and matches snapshot', async () => {
    const { toJSON } = await render(<Rating value={4.5} count={128} />);
    expect(toJSON()).toMatchSnapshot();
  });
});

describe('Avatar', () => {
  it('renders initials when no photo is supplied and matches snapshot', async () => {
    const { toJSON } = await render(<Avatar name="Jordan Lee" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
