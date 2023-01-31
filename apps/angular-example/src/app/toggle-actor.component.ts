import { DestroyService, injectMachine } from '@aldovelco/xstate-angular';
import { useSelector } from '@aldovelco/xstate-rxjs';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { toggleMachine } from '../machines/toggle.machine';

function count<T>(label: string) {
  return tap<T>(() => console.count(label));
}

@Component({
  selector: 'app-toggle-actor',
  standalone: true,
  imports: [NgIf, AsyncPipe, JsonPipe],
  providers: [DestroyService],
  template: `
    <ng-container *ngIf="state$ | async as state">
      <button type="button" (click)="send({ type: 'TOGGLE' })">
        Click me ({{ state.matches('active') ? '✅' : '❌' }})
      </button>
      <code>
        Toggled
        <strong>{{ state.context.count }}</strong> times
      </code>
    </ng-container>

    <pre>[select] Count: <code>{{ selectCount$ | async | json }}</code></pre>
    <pre>[useSelector] Count: <code>{{ useSelectCount$ | async | json }}</code></pre>
  `,
})
export class ToggleActorComponent implements OnInit {
  private actor = injectMachine(toggleMachine, { devTools: true });
  state$ = this.actor.state$.pipe(count('state'));
  send = this.actor.send;
  selectCount$ = this.actor.select((state) => state.context.count).pipe(count('select'));
  useSelectCount$ = useSelector(this.actor.service, (state) => state.context.count).pipe(count('useSelector'));

  ngOnInit() {}
}
