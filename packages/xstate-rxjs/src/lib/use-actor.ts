import { from, map, Observable, shareReplay, startWith } from 'rxjs';
import { ActorRef, EventObject, Sender } from 'xstate';
import { getServiceSnapshot, isService } from './utils';

export function isActorWithState<T extends ActorRef<any>>(actorRef: T): actorRef is T & { state: any } {
  return 'state' in actorRef;
}

function isDeferredActor<T extends ActorRef<any>>(actorRef: T): actorRef is T & { deferred: boolean } {
  return 'deferred' in actorRef;
}

type EmittedFromActorRef<TActor extends ActorRef<any, any>> = TActor extends ActorRef<any, infer TEmitted>
  ? TEmitted
  : never;

function defaultGetSnapshot<TEmitted>(actorRef: ActorRef<any, TEmitted>): TEmitted | undefined {
  return 'getSnapshot' in actorRef
    ? isService(actorRef)
      ? getServiceSnapshot(actorRef as any)
      : actorRef.getSnapshot()
    : isActorWithState(actorRef)
    ? (actorRef as any).state
    : undefined;
}

export function useActor<TActor extends ActorRef<any, any>>(
  actorRef: TActor,
  getSnapshot?: (actor: TActor) => EmittedFromActorRef<TActor>
): { state$: Observable<EmittedFromActorRef<TActor>>; send: TActor['send'] };
export function useActor<TEvent extends EventObject, TEmitted>(
  actorRef: ActorRef<TEvent, TEmitted>,
  getSnapshot?: (actor: ActorRef<TEvent, TEmitted>) => TEmitted
): { state$: Observable<TEmitted>; send: Sender<TEvent> };
export function useActor(
  actorRef: ActorRef<EventObject, unknown>,
  getSnapshot: (actor: ActorRef<EventObject, unknown>) => unknown = defaultGetSnapshot
): { state$: Observable<unknown>; send: Sender<EventObject> } {
  const deferredEvents = <(EventObject | string)[]>[];

  const send: Sender<EventObject> = (...args) => {
    const event = args[0];

    if (process.env['NODE_ENV'] !== 'production' && args.length > 1) {
      console.warn(
        `Unexpected payload: ${JSON.stringify(
          (args as any)[1]
        )}. Only a single event object can be sent to actor send() functions.`
      );
    }

    // If the previous actor is a deferred actor,
    // queue the events so that they can be replayed
    // on the non-deferred actor.
    if (isDeferredActor(actorRef) && actorRef.deferred) {
      deferredEvents.push(event);
    } else {
      actorRef.send(event);
    }
  };

  // Dequeue deferred events from the previous deferred actorRef
  while (deferredEvents.length > 0) {
    const deferredEvent = deferredEvents.shift()!;

    actorRef.send(deferredEvent);
  }

  const state$ = from(actorRef).pipe(
    map((actorRef) => getSnapshot(actorRef as any)),
    startWith(getSnapshot(actorRef)),
    shareReplay(1)
  );

  return { state$, send };
}
