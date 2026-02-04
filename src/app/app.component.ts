import { Component } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { HomePage } from './home/home.page';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';  // Assure-toi que ce plugin est installé !
import { App } from '@capacitor/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, HomePage],
})
export class AppComponent {
  constructor(private router: Router) {
    this.configurerBarresSysteme();
    this.configurerBoutonRetour();
  }

  private async configurerBarresSysteme() {
    // On ne fait ça que sur Android
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    try {
      // Status Bar (barre du haut) - Dark mode
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#0F1117' });
      await StatusBar.setStyle({ style: Style.Dark });

      // Navigation Bar (barre du bas) - Dark mode
      await NavigationBar.setNavigationBarColor({
        color: '#0F1117',
        darkButtons: false
      });
    } catch (error) {
      console.error('Erreur configuration barres système :', error);
    }
  }

  private configurerBoutonRetour() {
    // Gestion du bouton retour Android
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    let lastBackPressTime = 0;

    App.addListener('backButton', () => {
      const currentUrl = this.router.url;
      
      // Si on est sur login, on ne fait rien (on bloque le retour)
      if (currentUrl === '/login') {
        return;
      }
      
      // Si on est sur signin, on retourne au login
      if (currentUrl === '/signin') {
        this.router.navigate(['/login']);
        return;
      }
      
      // Si on est sur home, double-tap pour quitter
      if (currentUrl === '/home' || currentUrl.startsWith('/home')) {
        const currentTime = new Date().getTime();
        if (currentTime - lastBackPressTime < 2000) {
          App.exitApp();
        } else {
          lastBackPressTime = currentTime;
          // Optionnel : afficher un toast "Appuyez encore pour quitter"
        }
        return;
      }
      
      // Pour toutes les autres pages après login, on ramène à sub-list
      this.router.navigate(['/home']);
    });
  }
}
