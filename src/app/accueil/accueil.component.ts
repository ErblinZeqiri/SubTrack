import { Component } from "@angular/core";
import { SubListComponent } from "../sub-list/sub-list.component";
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
  imports: [SubListComponent, IonicModule],
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
