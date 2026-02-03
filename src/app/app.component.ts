import { Component } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { HomePage } from './home/home.page';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';  // Assure-toi que ce plugin est installé !

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, HomePage],
})
export class AppComponent {
  constructor() {
    this.configurerBarresSysteme();
  }

  private async configurerBarresSysteme() {
    // On ne fait ça que sur Android
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    try {
      // Status Bar (barre du haut)
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
      await StatusBar.setStyle({ style: Style.Light });

      // Navigation Bar (barre du bas)
      await NavigationBar.setNavigationBarColor({
        color: '#ffffff',
        darkButtons: true
      });
    } catch (error) {
      console.error('Erreur configuration barres système :', error);
    }
  }
}