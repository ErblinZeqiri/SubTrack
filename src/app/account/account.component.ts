import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
import { LoadingController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [IonicModule],
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
