import { Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';
import { userDataResolver } from './resolvers/user-data.resolver';

export const routes: Routes = [
  {
    path: 'home',
    children: [
      {
        path: '',
        component: AccueilComponent,
        resolve: {
          userData: userDataResolver
        }
      },
    ],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
