import { MachineRestParams, MaybeLazy, useMachine } from '@aldovelco/xstate-rxjs';
import { finalize, takeUntil } from 'rxjs';
import { AnyStateMachine, InterpreterStatus } from 'xstate';
import { injectDestroy } from './destroy.service';

export function injectMachine<TMachine extends AnyStateMachine>(
  getMachine: MaybeLazy<TMachine>,
  ...[options = {}]: MachineRestParams<TMachine>
) {
  const destroy$ = injectDestroy();

  const actor = useMachine(getMachine, options);
  const state$ = actor.state$.pipe(
    takeUntil(destroy$),
    finalize(() => {
      actor.service.stop();
      actor.service.status = InterpreterStatus.NotStarted;
    })
  );

  return { ...actor, state$ };
}
