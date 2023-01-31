import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DestroyService implements OnDestroy {
  private destroySubject = new Subject<void>();
  readonly destroy$ = this.destroySubject.asObservable();

  ngOnDestroy() {
    this.destroySubject.next();
    this.destroySubject.complete();
  }
}

export function injectDestroy() {
  try {
    return inject(DestroyService, { host: true }).destroy$;
  } catch (error) {
    throw new Error('`DestroyService` must be provided at the component level scope.');
  }
}
