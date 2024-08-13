import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { DatePipe } from '@angular/common';
import {
  RouteReuseStrategy,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyBPpboh7pXaboBXRILn2-_dmXxAM7ZOt2s',
        authDomain: 'subtrack-330ce.firebaseapp.com',
        projectId: 'subtrack-330ce',
        storageBucket: 'subtrack-330ce.appspot.com',
        messagingSenderId: '369263570865',
        appId: '1:369263570865:web:53efbd01fd38a7ab5b1790',
        measurementId: 'G-GCQPPGHLW0',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    DatePipe,
  ],
};
