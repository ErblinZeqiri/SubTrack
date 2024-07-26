import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import {
  LoadingController,
  NavController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonTitle, IonToolbar, IonHeader],
})
export class LoginComponent implements OnInit {
  constructor(
    private readonly authService: AuthService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {}

  async signin() {
    const loading = await this.loadingCtrl.create({
      message: 'Connexion...',
    });

    await loading.present();

    try {
      await this.authService.login();
      this.navCtrl.navigateRoot('/home');
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      await loading.dismiss();
    }
  }
}
