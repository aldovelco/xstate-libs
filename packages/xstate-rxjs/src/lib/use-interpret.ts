import {
  AnyStateMachine,
  AreAllImplementationsAssumedToBeProvided,
  InternalMachineOptions,
  interpret,
  InterpreterFrom,
  InterpreterOptions,
  Observer,
  State,
  StateFrom,
  toObserver,
} from 'xstate';
import { fromInterpreter } from './from-interpreter';
import { MaybeLazy, UseMachineOptions } from './types';

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
        >,
      observerOrListener?:
        | Observer<StateFrom<TMachine>>
        | ((value: StateFrom<TMachine>) => void)
    ]
  : [
      options?: InterpreterOptions &
        UseMachineOptions<TMachine['__TContext'], TMachine['__TEvent']> &
        InternalMachineOptions<
          TMachine['__TContext'],
          TMachine['__TEvent'],
          TMachine['__TResolvedTypesMeta']
        >,
      observerOrListener?:
        | Observer<StateFrom<TMachine>>
        | ((value: StateFrom<TMachine>) => void)
    ];

export function useInterpret<TMachine extends AnyStateMachine>(
  getMachine: MaybeLazy<TMachine>,
  ...[options = {}, observerOrListener]: RestParams<TMachine>
): InterpreterFrom<TMachine> {
  const machine = typeof getMachine === 'function' ? getMachine() : getMachine;

  const {
    context,
    guards,
    actions,
    activities,
    services,
    delays,
    state: rehydratedState,
    ...interpreterOptions
  } = options;

  const machineConfig = {
    context,
    guards,
    actions,
    activities,
    services,
    delays,
  };

  const machineWithConfig = machine.withConfig(machineConfig as any, () => ({
    ...machine.context,
    ...context,
  }));

  const service = interpret(machineWithConfig, interpreterOptions);

  if (observerOrListener) {
    const state$ = fromInterpreter(service);
    state$.subscribe(toObserver(observerOrListener as any));
  }

  service.start(rehydratedState ? (State.create(rehydratedState) as any) : undefined);

  return service as any;
}
