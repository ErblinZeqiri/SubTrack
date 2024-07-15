import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'subtrack-330ce',
        appId: '1:369263570865:web:53efbd01fd38a7ab5b1790',
        storageBucket: 'subtrack-330ce.appspot.com',
        apiKey: 'AIzaSyBPpboh7pXaboBXRILn2-_dmXxAM7ZOt2s',
        authDomain: 'subtrack-330ce.firebaseapp.com',
        messagingSenderId: '369263570865',
        measurementId: 'G-GCQPPGHLW0',
      })
    ),
    // provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
});
