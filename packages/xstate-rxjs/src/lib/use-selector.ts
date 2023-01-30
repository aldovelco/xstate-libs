import { distinctUntilChanged, from, map, Observable, startWith } from 'rxjs';
import { ActorRef, AnyInterpreter, Subscribable } from 'xstate';

import { isActorWithState } from './use-actor';

import { getServiceSnapshot } from './utils';

function isService(actor: any): actor is AnyInterpreter {
  return 'state' in actor && 'machine' in actor;
}

const defaultCompare = (a: any, b: any) => a === b;
const defaultGetSnapshot = (a: any) =>
  isService(a) ? getServiceSnapshot(a) : isActorWithState(a) ? a.state : undefined;

export function useSelector<
  TActor extends ActorRef<any, any>,
  T,
  TEmitted = TActor extends Subscribable<infer Emitted> ? Emitted : never
>(
  actor: TActor,
  selector: (emitted: TEmitted) => T,
  comparator: (a: T, b: T) => boolean = defaultCompare,
  getSnapshot: (a: TActor) => TEmitted = defaultGetSnapshot
): Observable<T> {
  const snapshot = selector(getSnapshot(actor));

  return from(actor).pipe(
    map((value) => selector(value)),
    startWith(snapshot),
    distinctUntilChanged(comparator)
  );
}
