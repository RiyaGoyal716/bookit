import { useToastQueueStore } from '../src/stores/toastQueueStore';

beforeEach(() => useToastQueueStore.getState().clear());

describe('toast queue', () => {
  it('pushes newest-first and caps the stack', () => {
    const { push } = useToastQueueStore.getState();
    push({ message: 'one' });
    push({ message: 'two' });
    push({ message: 'three' });
    push({ message: 'four' });
    const toasts = useToastQueueStore.getState().toasts;
    expect(toasts).toHaveLength(3);
    expect(toasts[0].message).toBe('four');
    expect(toasts.map((t) => t.message)).not.toContain('one');
  });

  it('dismisses by id', () => {
    const id = useToastQueueStore.getState().push({ message: 'bye' });
    useToastQueueStore.getState().dismiss(id);
    expect(useToastQueueStore.getState().toasts).toHaveLength(0);
  });

  it('runs an Undo action then dismisses', () => {
    const onAction = jest.fn();
    const id = useToastQueueStore
      .getState()
      .push({ message: 'Deleted', actionLabel: 'Undo', onAction });
    useToastQueueStore.getState().runAction(id);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(useToastQueueStore.getState().toasts).toHaveLength(0);
  });

  it('defaults duration and tone', () => {
    useToastQueueStore.getState().push({ message: 'hi' });
    const t = useToastQueueStore.getState().toasts[0];
    expect(t.duration).toBe(4000);
    expect(t.tone).toBe('default');
  });
});
