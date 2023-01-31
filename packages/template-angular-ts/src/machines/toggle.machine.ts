import { assign, createMachine } from 'xstate';

export interface ToggleMachineContext {
  count: number;
}
export type ToggleMachine = typeof toggleMachine;
export type CreateToggleMachine = typeof toggleMachine;

export const toggleMachine = createMachine({
  predictableActionArguments: true,
  tsTypes: {} as import("./toggle.machine.typegen").Typegen0,
  schema: {
    context: {} as ToggleMachineContext,
    events: {} as { type: 'TOGGLE' },
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
      entry: assign({
        count: (ctx: ToggleMachineContext) => ctx.count + 1,
      }),
      on: { TOGGLE: 'inactive' },
    },
  },
});
