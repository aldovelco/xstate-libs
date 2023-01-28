import {
  distinctUntilChanged,
  filter,
  finalize,
  from,
  map,
  Observable,
  shareReplay,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { AnyStateMachine, InterpreterFrom, Prop, StateFrom } from 'xstate';
import { UseMachineOptions } from './types';
import { useInterpret } from './use-interpret';

export function useMachine<TMachine extends AnyStateMachine>(machine: TMachine, options?: UseMachineOptions) {
  const { destroy$ = new Subject<void>(), ...interpreterOptions } = options ?? {};
  const service = useInterpret(machine, interpreterOptions);

  const state$ = from(service).pipe(
    filter((state) => state.changed || state.changed === undefined),
    startWith(service.getSnapshot()),
    shareReplay(1),
    takeUntil(destroy$),
    finalize(() => {
      service.stop();
    })
  ) as Observable<StateFrom<TMachine>>;

  const send = service.send as Prop<InterpreterFrom<TMachine>, 'send'>;

  const select = <T>(
    selector: (emitted: StateFrom<TMachine>) => T,
    comparator: (a: T, b: T) => boolean = (a, b) => a === b
  ) => {
    return state$.pipe(
      map((state) => selector(state)),
      distinctUntilChanged((previous, current) => comparator(previous, current))
    );
  };

  return { state$, send, service, select };
}
