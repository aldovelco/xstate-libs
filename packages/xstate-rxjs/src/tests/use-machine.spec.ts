import { Subject } from 'rxjs';
import { assign, createMachine, doneInvoke } from 'xstate';
import { waitFor } from 'xstate/lib/waitFor';
import { useMachine } from '../lib/use-machine';

const stop$ = new Subject<void>();

afterAll(() => {
  stop$.next();
});

const context = {
  data: undefined,
};
const fetchMachine = createMachine<typeof context>({
  predictableActionArguments: true,
  id: 'fetch',
  initial: 'idle',
  context,
  states: {
    idle: {
      on: { FETCH: 'loading' },
    },
    loading: {
      invoke: {
        id: 'fetchData',
        src: 'fetchData',
        onDone: {
          target: 'success',
          actions: assign({
            data: (_, e) => e.data,
          }),
          cond: (_, e) => e.data.length,
        },
      },
    },
    success: {
      type: 'final',
    },
  },
});

describe('useMachine composition function', () => {
  test('should work with a component ', async () => {
    const onFetch = () => new Promise((res) => setTimeout(() => res('some data'), 50));

    const { state$, send, service } = useMachine(fetchMachine, {
      stop$,
      services: {
        fetchData: onFetch,
      },
    });

    send({ type: 'FETCH' });

    const lastState = await waitFor(service, (state) => state.matches('success'));

    expect(lastState.context).toEqual({ data: 'some data' });
  });

  test('should work with a component with rehydrated state', async () => {
    const persistedFetchState = fetchMachine.transition('loading', doneInvoke('fetchData', 'persisted data'));
    const persistedFetchStateConfig = JSON.parse(JSON.stringify(persistedFetchState));
    const onFetch = () => new Promise((res) => setTimeout(() => res('some data'), 50));

    const { state$, send, service } = useMachine(fetchMachine, {
      stop$,
      services: {
        fetchData: onFetch,
      },
      state: persistedFetchStateConfig,
    });

    const lastState = await waitFor(service, (state) => state.matches('success'));
    expect(lastState.context).toEqual({ data: 'persisted data' });
  });

  test('should not crash without optional `options` parameter being provided', async () => {
    expect(() => useMachine(fetchMachine)).not.toThrow();
  });
});
