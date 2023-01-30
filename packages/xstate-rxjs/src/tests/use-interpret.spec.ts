import { Subject } from 'rxjs';
import { createMachine, StateFrom } from 'xstate';
import { useInterpret } from '../lib/use-interpret';

const machine = createMachine({
  predictableActionArguments: true,
  initial: 'inactive',
  states: {
    inactive: {
      on: {
        TOGGLE: 'active',
      },
    },
    active: {
      on: {
        TOGGLE: 'inactive',
      },
    },
  },
});

const stop$ = new Subject<void>();

afterAll(() => {
  stop$.next();
});

describe('useInterpret composable function', () => {
  test('observer should be called with initial state', async () => {
    let state: StateFrom<typeof machine>;
    const service = useInterpret(machine, { stop$ }, (nextState) => {
      state = nextState;
    });

    expect(state.value).toEqual('inactive');
  });

  test('observer should be called with next state', async () => {
    let state: StateFrom<typeof machine>;
    const service = useInterpret(machine, { stop$ }, (nextState) => {
      state = nextState;
    });

    expect(state.value).toEqual('inactive');

    service.send('TOGGLE');

    expect(state.value).toEqual('active');
  });
});