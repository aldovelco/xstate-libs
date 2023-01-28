import { assign, createMachine } from 'xstate';

interface ToggleMachineContext {
  count: number;
}

type ToggleMachineEvent = { type: 'TOGGLE' };

export const toggleMachine = createMachine({
  predictableActionArguments: true,
  tsTypes: {} as import('./toggle.machine.typegen').Typegen0,
  schema: {
    context: {} as ToggleMachineContext,
    events: {} as ToggleMachineEvent,
  },
  id: 'toggle',
  initial: 'inactive',
  context: {
    count: 0,
  },
  states: {
    inactive: {
      on: { TOGGLE: 'active' },
    },
    active: {
      entry: assign<ToggleMachineContext>({
        count: (ctx) => ctx.count + 1,
      }),
      on: { TOGGLE: 'inactive' },
    },
  },
});
