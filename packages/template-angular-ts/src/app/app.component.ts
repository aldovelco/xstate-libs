import { NxWelcomeComponent } from './nx-welcome.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent],
  selector: 'aldovelco-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'template-angular-ts';
}
