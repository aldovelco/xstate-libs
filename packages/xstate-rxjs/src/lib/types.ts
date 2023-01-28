import type { Observable } from 'rxjs';
import type { AnyStateMachine, InterpreterFrom, InterpreterOptions, Prop, StateFrom } from 'xstate';

export type MaybeLazy<T> = T | (() => T);

export type ComparatorFn<T> = (a: T, b: T) => boolean;

export type UseMachineOptions = InterpreterOptions & {
  destroy$?: Observable<void>;
};

export type UseMachineReturn<
  TMachine extends AnyStateMachine | ((...args: any[]) => AnyStateMachine),
  TInterpreter = InterpreterFrom<TMachine>
> = {
  state$: Observable<StateFrom<TMachine>>;
  send: Prop<TInterpreter, 'send'>;
  service: TInterpreter;
  select: <T>(selector: (state: StateFrom<TMachine>) => T, compare?: ComparatorFn<T>) => Observable<T>;
};
