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
  IonLoading, IonText } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { Subscription, User } from 'src/interfaces/interface';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data/data.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [IonText, 
    IonLoading,
    IonAlert,
    IonButton,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  userData$!: Observable<User[]>;
  userSubData$!: Observable<Subscription[]>;
  credentials: string | null = localStorage.getItem('user');
  userID: string = '';

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
        setTimeout(async () => {
          await this.authService.logout();
        }, 2500);
      },
    },
  ];

  constructor(
    private readonly authService: AuthService,
    private loadingCtrl: LoadingController,
    private readonly firestore: DataService,
    private readonly _auth: AuthService,
  ) {}

  ngOnInit() {
    if (this._auth.isAuthenticated()) {
      if (this.credentials !== null) {
        const localStorageData: any = JSON.parse(this.credentials);
        this.userID = localStorageData.uid;
        this.userData$ = this.firestore.loadUserData(localStorageData.uid);
      }
    }
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Déconnexion...',
      duration: 3000,
    });

    loading.present();
  }
}
