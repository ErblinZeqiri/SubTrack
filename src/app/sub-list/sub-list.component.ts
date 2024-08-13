import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription, User } from '../../interfaces/interface';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { map, Observable } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { AuthService } from '../services/auth/auth.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAlert,
  LoadingController,
  AlertController,
} from '@ionic/angular/standalone';
import { DonutChartComponent } from '../donut-chart/donut-chart.component';

@Component({
  selector: 'app-sub-list',
  standalone: true,
  imports: [
    IonAlert,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonRefresherContent,
    IonRefresher,
    IonLabel,
    IonItem,
    IonList,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    DonutChartComponent,
  ],
  templateUrl: './sub-list.component.html',
  styleUrls: ['./sub-list.component.css'],
  providers: [ExepensesService],
})
export class SubListComponent implements OnInit {
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;
  userID: string = '';
  userData$!: Observable<User[]>;
  userSubData$!: Observable<Subscription[]>;
  credentials: string | null = localStorage.getItem('user');

  constructor(
    private readonly expenses: ExepensesService,
    private readonly firestore: DataService,
    private readonly _router: Router,
    private readonly _auth: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    if (this._auth.isAuthenticated()) {
      if (this.credentials !== null) {
        const localStorageData: any = JSON.parse(this.credentials);
        this.userID = localStorageData.uid;
        this.userData$ = this.firestore.loadUserData(localStorageData.uid);
        this.userSubData$ = this.firestore.loadSubData(localStorageData.uid);
        this.monthlyExpenses$ = this.userSubData$.pipe(
          map((userSubData) =>
            this.expenses.getCurrentExpensesMonth(userSubData)
          )
        );
        this.yearlyExpenses$ = this.userSubData$.pipe(
          map((userSubData) =>
            this.expenses.getCurrentExpensesYear(userSubData)
          )
        );
      }
    }
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Suppression...',
      duration: 3000,
    });

    loading.present();
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  subDetails(sub: Subscription) {
    this._router.navigate(['/home/sub-details', sub.id]);
  }

  async deleteSub(sub: Subscription) {
    const loading = await this.loadingCtrl.create({
      message: 'Veuillez patienter...',
      duration: 3000,
    });

    const alert = await this.alertCtrl.create({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cet abonnement ?',
      buttons: [
        {
          text: 'Non',
          role: 'cancel',
        },
        {
          text: 'Oui',
          handler: async () => {
            await loading.present();

            try {
              await this.firestore.deleteSub(sub);
              console.log('Abonnement supprimé');

              this.userSubData$ = this.firestore.loadSubData(this.userID);
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
            } finally {
              loading.dismiss();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  updateSub(sub: Subscription){
    this._router.navigate(['/update', sub.id])
  }
}
