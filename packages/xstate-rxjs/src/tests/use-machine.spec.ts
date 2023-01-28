import { isObservable } from 'rxjs';
import { useMachine } from '../lib/use-machine';
import { toggleMachine } from './machines/toggle.machine';

describe('useMachine', () => {
  it('should work', () => {
    const machine = useMachine(toggleMachine);

    expect(machine.service.initialState.context).toEqual({ count: 0 });
  });

  it('should expose an observable `state$` property', () => {
    const actor = useMachine(toggleMachine);

    expect(isObservable(actor.state$)).toBeTruthy();
  });
});
