import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { BehaviorSubject, firstValueFrom, switchMap, take } from 'rxjs';
import { ActorRef, ActorRefFrom, createMachine, interpret, sendParent, toActorRef } from 'xstate';
import { useActor } from '../lib/use-actor';
import { useMachine } from '../lib/use-machine';

describe('useActor composable function', () => {
  test('initial invoked actor should be immediately available', async () => {
    const childMachine = createMachine({
      predictableActionArguments: true,
      id: 'childMachine',
      initial: 'active',
      states: {
        active: {
          on: {
            FINISH: { actions: sendParent('FINISH') },
          },
        },
      },
    });
    const machine = createMachine({
      predictableActionArguments: true,
      initial: 'active',
      invoke: {
        id: 'child',
        src: childMachine,
      },
      states: {
        active: {
          on: { FINISH: 'success' },
        },
        success: {},
      },
    });

    const { service } = useMachine(machine);
    const actorRef = (service.getSnapshot().children as any).child as ActorRefFrom<typeof childMachine>;

    const actorState = await firstValueFrom(useActor(actorRef).state$);
    expect(actorState.value).toEqual('active');
  });

  test('invoked actor in a standalone component should be able to receive events', async () => {
    const childMachine = createMachine({
      predictableActionArguments: true,
      id: 'childMachine',
      initial: 'active',
      states: {
        active: {
          on: {
            FINISH: { actions: sendParent('FINISH') },
          },
        },
      },
    });
    const machine = createMachine({
      predictableActionArguments: true,
      initial: 'active',
      invoke: {
        id: 'child',
        src: childMachine,
      },
      states: {
        active: {
          on: { FINISH: 'success' },
        },
        success: {},
      },
    });

    const service = interpret(machine).start();
    const actorRef = (service.getSnapshot().children as any).child as ActorRefFrom<typeof childMachine>;

    const actorState = await firstValueFrom(useActor(actorRef).state$);
    expect(actorState.value).toEqual('active');
  });

  test('actor should provide snapshot value immediately', async () => {
    const simpleActor: ActorRef<any, number> & { latestValue: number } = toActorRef({
      send: () => {
        /* ... */
      },
      latestValue: 42,
      subscribe: () => {
        return {
          unsubscribe: () => {
            /* ... */
          },
        };
      },
    });

    const { state$ } = useActor(simpleActor, (a) => a.latestValue);
    const result = await firstValueFrom(state$);
    expect(result).toEqual(42);
  });

  // TODO: `rxjs` is different from react and vue, is this needed?
  test('should update snapshot value when actor changes', async () => {
    const createSimpleActor = (value: number): ActorRef<any, number> & { latestValue: number } =>
      toActorRef({
        send: () => {
          /* ... */
        },
        latestValue: value,
        subscribe: () => {
          return {
            unsubscribe: () => {
              /* ... */
            },
          };
        },
      });

    const valueSubject = new BehaviorSubject<number>(42);
    const latestValue$ = valueSubject.pipe(
      switchMap((value) => useActor(createSimpleActor(value), (a) => a.latestValue).state$)
    );

    const observerSpy = subscribeSpyTo(latestValue$.pipe(take(2)));
    valueSubject.next(100);

    await observerSpy.onComplete();

    expect(observerSpy.getValues()).toStrictEqual([42, 100]);
  });
});
