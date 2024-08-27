import { Component, OnInit, SimpleChanges } from '@angular/core';
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
  IonText,
} from '@ionic/angular/standalone';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { Subscription, User } from 'src/interfaces/interface';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data/data.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    IonText,
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
  userData$: Observable<User[]> = new Observable<User[]>();
  userSubData$: Observable<Subscription[]> = new Observable<Subscription[]>();
  credentials: string = this._auth.getToken();
  userID: string = JSON.parse(this.credentials).uid;

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
          this._dataService.clearData();
        }, 2500);
      },
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService,
    private loadingCtrl: LoadingController,
    private readonly _dataService: DataService,
    private readonly _auth: AuthService
  ) {}

  ngOnInit() {
    if (this._auth.isAuthenticated()) {
      if (this.credentials !== null) {
        // Load user data
        this.userData$ = this._dataService
          .loadUserData(this.userID)
          .pipe(takeUntil(this.destroy$));

        // Load subscription data
        this.userSubData$ = this._dataService
          .loadSubData(this.userID)
          .pipe(takeUntil(this.destroy$));
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
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
