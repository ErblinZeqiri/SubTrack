import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonTabs,
  IonIcon,
  IonTabButton,
  IonTabBar,
} from '@ionic/angular/standalone';
import {
  homeOutline,
  search,
  addOutline,
  notificationsOutline,
  personOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SubListComponent } from '../sub-list/sub-list.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonTabs,
  ],
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
