import { Observable, Subject, takeUntil } from 'rxjs';
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

type UseMachineReturn<TMachine extends AnyStateMachine, TInterpreter = InterpreterFrom<TMachine>> = {
  state$: Observable<StateFrom<TMachine>>;
  send: Prop<TInterpreter, 'send'>;
  service: TInterpreter;
};

export function useMachine<TMachine extends AnyStateMachine>(
  getMachine: MaybeLazy<TMachine>,
  ...[options = {} as any]: RestParams<TMachine>
): UseMachineReturn<TMachine> {
  const { stop$ = new Subject<void>(), ...restOptions } = options;
  const service = useInterpret(getMachine, { ...restOptions, stop$ });

  const rehydratedState = options.state;
  service.start(rehydratedState ? (State.create(rehydratedState) as any) : undefined);

  const state$ = fromInterpreter(service).pipe(takeUntil(stop$));

  return { state$, send: service.send, service } as any;
}
