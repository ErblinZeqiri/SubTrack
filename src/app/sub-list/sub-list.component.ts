import { Component, OnInit } from '@angular/core';
import { Subscription, User } from '../../interfaces/interface';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import {
  firstValueFrom,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
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
  IonText,
  IonSelect,
  IonSelectOption,
  IonLoading,
} from '@ionic/angular/standalone';
import { DonutChartComponent } from '../donut-chart/donut-chart.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-sub-list',
  standalone: true,
  imports: [
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
export class SubListComponent implements OnInit {
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

  constructor(
    private readonly _dataService: DataService,
    private readonly _router: Router,
    private readonly _auth: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private httpClient: HttpClient
  ) {}

  // Méthode pour gérer la sélection des filtres
  async onFilterChange() {
    const filters = {
      category: this.selectedCategory,
      renewal: this.selectedRenewal,
    };

    const data: any = await firstValueFrom(
      this.httpClient.post(
        'https://subtrack-330ce.cloudfunctions.net/filterSubscriptions',
        filters
      )
    );
    this.userSubData$ = of(data); // Mettre à jour les données des abonnements
  }

  ngOnInit(): void {
    this.userSubData$ = this._auth.getCurrentUser().pipe(
      // tap((e) => console.log('oninit', e)),
      switchMap(async (user) => {
        if (user) {
          await this._dataService.loadSubData(user.uid);
          this.noSub = false;
        } else {
          this.noSub = true;
        }
      }),
      switchMap(() => this._dataService.userSubData$)
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
              await this._dataService.deleteSub(sub);
              const user = await firstValueFrom(this._auth.getCurrentUser());
              if (user) {
                await this._dataService.loadSubData(user.uid);
              }
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
