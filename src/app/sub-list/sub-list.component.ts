import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, User } from '../../interfaces/interface';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import {
  catchError,
  first,
  firstValueFrom,
  from,
  lastValueFrom,
  map,
  Observable,
  of,
  switchMap,
  tap,
  Subscription as RxSubscription 
} from 'rxjs';
import { DataService } from '../services/data/data.service';
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
  IonText,
  IonSelect,
  IonSelectOption,
  IonLoading,
  IonButton,
  IonCol,
  IonRow,
  IonGrid,
} from '@ionic/angular/standalone';
import { DonutChartComponent } from '../donut-chart/donut-chart.component';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-sub-list',
  standalone: true,
  imports: [
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonText,
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
    IonSelect,
    IonSelectOption,
    FormsModule,
    IonLoading,
  ],
  templateUrl: './sub-list.component.html',
  styleUrls: ['./sub-list.component.css'],
  providers: [ExepensesService],
})
export class SubListComponent implements OnInit, OnDestroy {
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;
  userSubData$!: Observable<Subscription[]>;
  noSub: boolean = false;
  subscriptionCategories: string[] = [
    'Divertissement',
    'Indispensable',
    'Streaming',
    'Presse',
    'Fitness',
    'Jeux',
    'Cuisine',
    'Éducation',
    'Technologie',
    'Mode',
    'Finance',
    'Voyage',
  ];
  subscriptionRenewal: string[] = [
    'Hebdomadaire',
    'Mensuel',
    'Trimestriel',
    'Semestriel',
    'Annuel',
  ];
  selectedCategory = 'Tout';
  selectedRenewal = 'Tout';
  filteredData: Subscription[] = [];
  private subscriptionsUpdateSubscription!: RxSubscription;

  constructor(
    private readonly _dataService: DataService,
    private readonly _router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}
  ngOnInit(): void {
    // this.userSubData$ = this._dataService.loadSubData().pipe(
    //   catchError((err) => {
    //     if (err.status === 404) {
    //       this.noSub = true;
    //       return of([]);
    //     } else {
    //       throw err;
    //     }
    //   })
    // );
    
    this.loadSubscriptions();
    this.fetchSubscriptions();
    this.subscriptionsUpdateSubscription = this._dataService.subscriptionUpdated$.subscribe(() => {
      this.loadSubscriptions(); // Rechargez les abonnements
    });
  }

  async fetchSubscriptions(): Promise<void> {
    await lastValueFrom(
      this._dataService
        .getFilteredSubscriptions(this.selectedCategory, this.selectedRenewal)
        .pipe(
          catchError((err) => {
            if (err.status === 404) {
              this.noSub = true;
              return of([]);
            } else {
              throw err;
            }
          })
        )
    )
      .then((data) => {
        this.userSubData$ = of(data);
        console.log('data', data);
        this.noSub = !data || data.length === 0;
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des abonnements : ', error);
      });
  }

  async onFilterChange() {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement des données...',
      duration: 2000,
    });

    await loading.present();

    try {
      await this.fetchSubscriptions();
      loading.dismiss();
    } catch (error) {
      loading.dismiss();
      console.error('Erreur lors du chargement des abonnements : ', error);
    }
  }

  resetFilter() {
    this.selectedCategory = 'Tout';
    this.selectedRenewal = 'Tout';
    this.fetchSubscriptions();
  }


  ngOnDestroy(): void {
    this.subscriptionsUpdateSubscription.unsubscribe(); // Libérez la mémoire
  }

  loadSubscriptions(): void {
    this.userSubData$ = this._dataService.loadSubData().pipe(
      catchError((err) => {
        if (err.status === 404) {
          this.noSub = true;
          return of([]);
        } else {
          throw err;
        }
      })
    );
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
    console.log('deleteSub', sub.id);


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
            await this.showLoading();

            try {
              await lastValueFrom(
                this._dataService.deleteSub(sub.id).pipe(first())
              );
              this.userSubData$ = this._dataService.loadSubData().pipe(
                catchError((err) => {
                  if (err.status === 404) {
                    this.noSub = true;
                    return of([]);
                  } else {
                    throw err;
                  }
                })
              );
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
            }
          },
        },
      ],
    });

    await alert.present();
  }

  updateSub(sub: Subscription) {
    this._router.navigate(['/update', sub.id]);
  }
}
