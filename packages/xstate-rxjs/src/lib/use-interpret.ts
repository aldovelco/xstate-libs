/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AnyStateMachine,
  interpret,
  InterpreterFrom,
  InterpreterOptions,
} from 'xstate';
import { MaybeLazy } from './types';

export function useInterpret<TMachine extends AnyStateMachine>(
  getMachine: MaybeLazy<TMachine>,
  options?: InterpreterOptions
): InterpreterFrom<TMachine> {
  const machine = typeof getMachine === 'function' ? getMachine() : getMachine;
  const { ...interpreterOptions } = options;

  const service = interpret(machine, {
    ...interpreterOptions,
  });

  service.start();

  return service as any;
}
