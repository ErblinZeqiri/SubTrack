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
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

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
    CommonModule,
  ],
})
export class HomePage {
  showTabBar = true;
  selectedTab = 'home';

  constructor(private router: Router) {
    addIcons({
      homeOutline,
      search,
      addOutline,
      notificationsOutline,
      personOutline,
    });

    // Cacher la tab bar sur les pages login/signin et mettre à jour le tab sélectionné
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.url.split('?')[0];
        this.showTabBar = !(url === '/login' || url === '/signin');
        
        // Mettre à jour le tab sélectionné en fonction de l'URL
        if (url === '/home' || url.startsWith('/home/')) {
          this.selectedTab = 'home';
        } else if (url === '/add') {
          this.selectedTab = 'add';
        } else if (url === '/account') {
          this.selectedTab = 'account';
        }
      });
  }
}
