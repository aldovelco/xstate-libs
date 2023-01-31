import { distinctUntilChanged, map, Observable } from 'rxjs';
import {
  AnyStateMachine,
  AreAllImplementationsAssumedToBeProvided,
  InternalMachineOptions,
  InterpreterFrom,
  InterpreterOptions,
  State,
  StateFrom,
} from 'xstate';
import { fromInterpreter } from './from-interpreter';
import { MaybeLazy, Prop, UseMachineOptions } from './types';
import { useInterpret } from './use-interpret';

// prettier-ignore
type RestParams<
  TMachine extends AnyStateMachine
> = AreAllImplementationsAssumedToBeProvided<
  TMachine['__TResolvedTypesMeta']
> extends false
  ? [
      options: InterpreterOptions &
        UseMachineOptions<TMachine['__TContext'], TMachine['__TEvent']> &
        InternalMachineOptions<
          TMachine['__TContext'],
          TMachine['__TEvent'],
          TMachine['__TResolvedTypesMeta'],
          true
        >
    ]
  : [
      options?: InterpreterOptions &
        UseMachineOptions<TMachine['__TContext'], TMachine['__TEvent']> &
        InternalMachineOptions<
          TMachine['__TContext'],
          TMachine['__TEvent'],
          TMachine['__TResolvedTypesMeta']
        >
    ];

export type MachineRestParams<TMachine extends AnyStateMachine> = RestParams<TMachine>;

export type UseMachineReturnType<TMachine extends AnyStateMachine, TInterpreter = InterpreterFrom<TMachine>> = {
  service: TInterpreter;
  state$: Observable<StateFrom<TMachine>>;
  send: Prop<TInterpreter, 'send'>;
  select: <T>(selector: (state: StateFrom<TMachine>) => T, comparator?: (a: T, b: T) => boolean) => Observable<T>;
};

export function useMachine<TMachine extends AnyStateMachine>(
  getMachine: MaybeLazy<TMachine>,
  ...[options = {}]: RestParams<TMachine>
): UseMachineReturnType<TMachine> {
  const service = useInterpret(getMachine, options);

  const rehydratedState = options.state;
  service.start(rehydratedState ? (State.create(rehydratedState) as any) : undefined);

  const state$ = fromInterpreter(service);
  const send = service.send as Prop<InterpreterFrom<TMachine>, 'send'>;
  // TODO: Should we expose a select method directly?
  const defaultComparator = (a: any, b: any) => a === b;
  const select = <T>(
    selector: (state: StateFrom<TMachine>) => T,
    comparator: (a: T, b: T) => boolean = defaultComparator
  ) => {
    return state$.pipe(
      map((value) => selector(value)),
      distinctUntilChanged(comparator)
    );
  };

  return { service, state$, send, select };
}
