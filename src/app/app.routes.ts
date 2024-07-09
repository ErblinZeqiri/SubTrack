import { Routes } from "@angular/router";
import { AccueilComponent } from "./accueil/accueil.component";
import { userDataResolver } from "./resolvers/user-data.resolver";
import { SubListComponent } from "./sub-list/sub-list.component";
import { SubDetailsComponent } from "./sub-details/sub-details.component";
import { AppComponent } from "./app.component";

export const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  {
    path: "home",
    component: AccueilComponent,
    resolve: { data: userDataResolver },
  },
  {
    path: "home/sub-details/:id",
    component: SubDetailsComponent,
    resolve: { userData: userDataResolver },
  },
];
