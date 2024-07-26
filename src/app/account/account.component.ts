import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import {
  LoadingController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonAlert,
  IonLoading,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    IonLoading,
    IonAlert,
    IonButton,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  public alertButtons = [
    {
      text: 'Non',
      role: 'cancel',
      handler: () => {},
    },
    {
      text: 'Oui',
      role: 'confirm',
      handler: async () => {
        await this.showLoading();
        await this.authService.logout();
      },
    },
  ];

  constructor(
    private readonly authService: AuthService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Déconnexion...',
      duration: 3000,
    });

    loading.present();
  }
}
