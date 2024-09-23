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
  IonText,
} from '@ionic/angular/standalone';
import { map, Observable, pipe, Subject, tap } from 'rxjs';
import { Subscription } from 'src/interfaces/interface';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data/data.service';
import { User } from '@angular/fire/auth';

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
  userData$: Observable<User | null> = new Observable<User | null>();

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
    this.userData$ = this._auth.getCurrentUser().pipe(
      tap((e) => console.log('oninit', e)));
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
