import { SendFrom, UseMachineReturnType } from '@aldovelco/xstate-rxjs';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StateFrom } from 'xstate';
import { toggleMachine } from '../machines/toggle.machine';

@Component({
  selector: 'app-toggle-actor-input',
  standalone: true,
  imports: [NgIf, AsyncPipe, JsonPipe],
  template: `
    <button type="button" (click)="send({ type: 'TOGGLE' })">
      Click me ({{ state.matches('active') ? '✅' : '❌' }})
    </button>
    <code>
      Toggled
      <strong>{{ state.context.count }}</strong> times
    </code>
  `,
})
export class ToggleActorInputComponent {
  @Input() actor!: UseMachineReturnType<typeof toggleMachine>;
  @Input() state!: StateFrom<typeof toggleMachine>;
  @Input() send!: SendFrom<typeof toggleMachine>;
}
