import { getApps, initializeApp } from 'firebase/app';
import { environment } from './environments/environment';

// Vérifier si une instance Firebase existe déjà ; sinon, l'initialiser explicitement.
if (!getApps().length) {
  initializeApp(environment.firebaseConfig);
}


import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
