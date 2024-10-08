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
import {
  filter,
  lastValueFrom,
  map,
  Observable,
  pipe,
  Subject,
  tap,
} from 'rxjs';
import { User } from 'src/interfaces/interface';
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
  userData$!: Observable<User>;

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
          try {
            this._auth.logout();
            this._dataService.clearData();
          } catch (error) {
            console.error('Erreur lors de la déconnexion', error);
          }
        }, 2500);
      },
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private loadingCtrl: LoadingController,
    private readonly _dataService: DataService,
    private readonly _auth: AuthService
  ) {}

  ngOnInit() {
    this.userData$ = this._auth.getCurrentUser().pipe(
      filter((user): user is User => !!user),
      map((user) => user as unknown as User)
    )
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
