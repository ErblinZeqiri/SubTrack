import { Routes } from '@angular/router';
import { authGuard } from './guard/auth/auth.guard';
import { SubListComponent } from './sub-list/sub-list.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import { SubDetailsComponent } from './sub-details/sub-details.component';
import { SearchComponent } from './search/search.component';
import { AddSubComponent } from './add-sub/add-sub.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { SigninComponent } from './signin/signin.component'
import { UpdateSubComponent } from './update-sub/update-sub.component'
import { Page404Component } from './page404/page404.component'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: SubListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home/sub-details/:id',
    component: SubDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [authGuard],
  },
  {
    path: 'add',
    component: AddSubComponent,
    canActivate: [authGuard],
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [authGuard],
  },
  {
    path: 'signin',
    component: SigninComponent,
  },
  {
    path: 'update/:id',
    component: UpdateSubComponent,
    canActivate: [authGuard],
  },
  {
    path: '404',
    component: Page404Component,
  },
  {
    path: '**',
    redirectTo: '404',
    pathMatch: 'full',
  },
]
