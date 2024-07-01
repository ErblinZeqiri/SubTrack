import { Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';

export const routes: Routes = [
  {
    path: 'home',
    children: [
      {
        path: '',
        component: AccueilComponent
      },
    ],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
