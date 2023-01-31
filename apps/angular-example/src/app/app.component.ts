import { DestroyService, injectMachine } from '@aldovelco/xstate-angular';
import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { toggleMachine } from '../machines/toggle.machine';
import { ToggleActorInputComponent } from './toggle-actor-input.component';
import { ToggleActorComponent } from './toggle-actor.component';

@Component({
  standalone: true,
  imports: [NgIf, AsyncPipe, ToggleActorComponent, ToggleActorInputComponent],
  providers: [DestroyService],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  show = true;

  toggleActor = injectMachine(toggleMachine, { devTools: true });
}
