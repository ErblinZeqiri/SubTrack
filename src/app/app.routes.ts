import { Routes } from "@angular/router";
import { AccueilComponent } from "./accueil/accueil.component";
import { userDataResolver } from "./resolvers/user-data.resolver";
import { SubListComponent } from "./sub-list/sub-list.component";
import { SubDetailsComponent } from "./sub-details/sub-details.component";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    component: AccueilComponent,
    resolve: { userData: userDataResolver },
  },
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home/sub-details/:subId",
    component: SubDetailsComponent,
  },
];
