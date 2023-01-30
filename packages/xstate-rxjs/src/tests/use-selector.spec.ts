import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { take } from 'rxjs';
import { assign, createMachine } from 'xstate';
import { useInterpret } from '../lib/use-interpret';
import { useSelector } from '../lib/use-selector';

describe('useSelector', () => {
  test('only rerenders for selected values', async () => {
    const machine = createMachine<{ count: number; other: number }>({
      predictableActionArguments: true,
      initial: 'active',
      context: {
        other: 0,
        count: 0,
      },
      states: {
        active: {},
      },
      on: {
        OTHER: {
          actions: assign({ other: (ctx) => ctx.other + 1 }),
        },
        INCREMENT: {
          actions: assign({ count: (ctx) => ctx.count + 1 }),
        },
      },
    });

    const service = useInterpret(machine);
    const count$ = useSelector(service, (state) => state.context.count);
    const observerSpy = subscribeSpyTo(count$.pipe(take(3)));

    service.send({ type: 'INCREMENT' });
    service.send({ type: 'OTHER' });
    service.send({ type: 'OTHER' });
    service.send({ type: 'OTHER' });
    service.send({ type: 'OTHER' });
    service.send({ type: 'INCREMENT' });

    await observerSpy.onComplete();

    expect(observerSpy.getValues()).toStrictEqual([0, 1, 2]);
  });

  test('should work with a custom comparison function', async () => {
    const machine = createMachine<{ name: string }>({
      predictableActionArguments: true,
      initial: 'active',
      context: {
        name: 'david',
      },
      states: {
        active: {},
      },
      on: {
        CHANGE: {
          actions: assign({ name: (_, e) => e.value }),
        },
      },
    });

    const service = useInterpret(machine);
    const name$ = useSelector(
      service,
      (state) => state.context.name,
      (a, b) => a.toUpperCase() === b.toUpperCase()
    );

    const observerSpy = subscribeSpyTo(name$.pipe(take(3)));

    service.send({ type: 'CHANGE', value: 'DAVID' });
    service.send({ type: 'CHANGE', value: 'other' });
    service.send({ type: 'CHANGE', value: 'DAVID' });

    await observerSpy.onComplete();

    expect(observerSpy.getValues()).toStrictEqual(['david', 'other', 'DAVID']);
  });
});
