import { bootstrapApplication } from '@angular/platform-browser';
import { inspect } from '@xstate/inspect';
import { AppComponent } from './app/app.component';

inspect({ iframe: false });
bootstrapApplication(AppComponent).catch((err) => console.error(err));
