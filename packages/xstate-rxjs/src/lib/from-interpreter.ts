import { distinctUntilChanged, from, Observable, shareReplay } from 'rxjs';
import { AnyStateMachine, InterpreterFrom, InterpreterStatus, StateFrom } from 'xstate';

export function fromInterpreter<TMachine extends AnyStateMachine>(
  service: InterpreterFrom<TMachine>
): Observable<StateFrom<TMachine>> {
  return from(service).pipe(
    distinctUntilChanged((prevState, nextState) => {
      if (service.status === InterpreterStatus.NotStarted) {
        return true;
      }

      // Only change the current state if:
      // - the incoming state is the "live" initial state (since it might have new actors)
      // - OR the incoming state actually changed.
      //
      // The "live" initial state will have .changed === undefined.
      const initialStateChanged =
        nextState.changed === undefined &&
        (Object.keys(nextState.children).length > 0 || typeof prevState.changed === 'boolean');

      return !(nextState.changed || initialStateChanged);
    }),
    shareReplay(1)
  ) as any;
}
