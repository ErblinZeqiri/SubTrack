import { Component } from "@angular/core";
import { SubListComponent } from "../sub-list/sub-list.component";
import { RouterOutlet } from "@angular/router";
import {
  homeOutline,
  search,
  addOutline,
  notificationsOutline,
  personOutline,
} from "ionicons/icons";
import { addIcons } from "ionicons";
import { IonicModule } from "@ionic/angular";

@Component({
  selector: "app-accueil",
  standalone: true,
  imports: [SubListComponent, RouterOutlet, IonicModule],
  templateUrl: "./accueil.component.html",
  styleUrl: "./accueil.component.css",
})
export class AccueilComponent {
  constructor() {
    addIcons({
      homeOutline,
      search,
      addOutline,
      notificationsOutline,
      personOutline,
    });
  }
}
