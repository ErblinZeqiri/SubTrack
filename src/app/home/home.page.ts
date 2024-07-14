import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import {
  homeOutline,
  search,
  addOutline,
  notificationsOutline,
  personOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SubListComponent } from "../sub-list/sub-list.component";
import { IonicModule } from "@ionic/angular";


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, SubListComponent, IonicModule],
})
export class HomePage {
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
