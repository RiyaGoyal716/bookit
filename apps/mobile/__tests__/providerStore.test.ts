import { useProviderStore, countByStatus } from '../src/stores/providerStore';

describe('providerStore', () => {
  // Reset to a known set of jobs before each test.
  beforeEach(() => {
    useProviderStore.setState({
      jobs: [
        {
          id: 'T-1',
          customer: 'A',
          service: 'Clean',
          date: 'Today',
          time: '13:00',
          amount: 40,
          area: 'LS6',
          status: 'request',
          expiresInSec: 60,
        },
        {
          id: 'T-2',
          customer: 'B',
          service: 'Clean',
          date: 'Today',
          time: '15:00',
          amount: 50,
          area: 'LS6',
          status: 'request',
          expiresInSec: 60,
        },
      ],
    });
  });

  it('acceptJob moves a request to scheduled and clears the countdown', () => {
    useProviderStore.getState().acceptJob('T-1');
    const job = useProviderStore.getState().jobs.find((j) => j.id === 'T-1');
    expect(job?.status).toBe('scheduled');
    expect(job?.expiresInSec).toBeUndefined();
  });

  it('declineJob moves a request to declined', () => {
    useProviderStore.getState().declineJob('T-2');
    const job = useProviderStore.getState().jobs.find((j) => j.id === 'T-2');
    expect(job?.status).toBe('declined');
  });

  it('countByStatus reflects accept/decline outcomes', () => {
    const store = useProviderStore.getState();
    expect(countByStatus(store.jobs, 'request')).toBe(2);
    store.acceptJob('T-1');
    store.declineJob('T-2');
    const jobs = useProviderStore.getState().jobs;
    expect(countByStatus(jobs, 'request')).toBe(0);
    expect(countByStatus(jobs, 'scheduled')).toBe(1);
    expect(countByStatus(jobs, 'declined')).toBe(1);
  });

  it('advanceJob walks scheduled -> in_progress -> completed', () => {
    useProviderStore.getState().acceptJob('T-1');
    useProviderStore.getState().advanceJob('T-1');
    expect(useProviderStore.getState().jobs.find((j) => j.id === 'T-1')?.status).toBe(
      'in_progress',
    );
    useProviderStore.getState().advanceJob('T-1');
    expect(useProviderStore.getState().jobs.find((j) => j.id === 'T-1')?.status).toBe('completed');
  });
});
