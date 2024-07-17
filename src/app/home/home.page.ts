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
<<<<<<< HEAD
=======
import { SubListComponent } from "../sub-list/sub-list.component";
>>>>>>> ccbe8df2738eff373637b687dfb398380413ab48
import { IonicModule } from "@ionic/angular";


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
<<<<<<< HEAD
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonicModule],
=======
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, SubListComponent, IonicModule],
>>>>>>> ccbe8df2738eff373637b687dfb398380413ab48
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
