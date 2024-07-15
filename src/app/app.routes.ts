import { Routes } from '@angular/router';
// import { userDataResolver } from "./resolvers/user-data.resolver";
import { SubDetailsComponent } from './sub-details/sub-details.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { SearchComponent } from './search/search.component';
import { AddSubComponent } from './add-sub/add-sub.component';
import { AccountComponent } from './account/account.component';
import { SubListComponent } from './sub-list/sub-list.component';
import { subDataResolver } from './resolvers/subData/sub-data.resolver';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: SubListComponent,
  },
  {
    path: 'home/sub-details/:id',
    component: SubDetailsComponent,
    // resolve: { subData: subDataResolver },
  },
  {
    path: 'search',
    component: SearchComponent,
  },
  {
    path: 'add',
    component: AddSubComponent,
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
  },
  {
    path: 'account',
    component: AccountComponent,
  },
];
