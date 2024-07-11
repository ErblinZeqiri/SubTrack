import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { AccueilComponent } from "./accueil/accueil.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, IonicModule, AccueilComponent],
  template: ` <ion-app>
    <app-accueil> </app-accueil>
  </ion-app>`,
})
export class AppComponent {}
