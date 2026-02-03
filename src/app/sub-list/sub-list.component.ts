import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Subscription, User } from '../../interfaces/interface';
import { ExepensesService } from '../services/expenses/exepenses.service';
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_RENEWAL_TYPES,
} from '../constants/subscription.constants';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import {
  concat,
  concatMap,
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
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { DonutChartComponent } from '../donut-chart/donut-chart.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgModel } from '@angular/forms';
import { addIcons } from 'ionicons';
import { funnelOutline, calendarOutline, closeOutline, close } from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sub-list',
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonText,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonRefresherContent,
    IonRefresher,
    IonItem,
    IonList,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    DonutChartComponent,
    IonSelect,
    IonSelectOption,
    FormsModule,
    IonLoading,
  ],
  templateUrl: './sub-list.component.html',
  styleUrls: ['./sub-list.component.css', './expenses-summary.css'],
  providers: [ExepensesService],
})
export class SubListComponent implements OnInit {
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;
  userSubData$!: Observable<Subscription[]>;
  noSub: boolean = false;
  
  // Use imported constants instead of duplicating
  readonly subscriptionCategories = SUBSCRIPTION_CATEGORIES;
  readonly subscriptionRenewal = SUBSCRIPTION_RENEWAL_TYPES;
  selectedCategory = 'Tout';
  selectedRenewal = 'Tout';
  userID!: string;
  private readonly destroyRef = inject(DestroyRef);

  get hasActiveFilters(): boolean {
    return this.selectedCategory !== 'Tout' || this.selectedRenewal !== 'Tout';
  }

  constructor(
    private readonly _dataService: DataService,
    private readonly _router: Router,
    private readonly _auth: AuthService,
    private readonly loadingCtrl: LoadingController,
    private readonly alertCtrl: AlertController,
    private readonly httpClient: HttpClient,
    private readonly _expensesService: ExepensesService
  ) {
    addIcons({ funnelOutline, calendarOutline, close });
  }

  async onFilterChange() {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement...',
    });

    await loading.present();
    const filters = {
      category: this.selectedCategory,
      renewal: this.selectedRenewal,
      userID: this.userID,
    };

    const data = await firstValueFrom(
      this.httpClient.post<Subscription[]>(
        'https://us-central1-subtrack-330ce.cloudfunctions.net/filterSubscriptions',
        filters
      )
    );

    const hasData = Array.isArray(data) && data.length > 0;
    this.noSub = !hasData;
    this.userSubData$ = of(hasData ? data : []);
    this.monthlyExpenses$ = this._expensesService.getCurrentExpensesMonth(
      this.userSubData$
    );
    this.yearlyExpenses$ = this._expensesService.getCurrentExpensesYear(
      this.userSubData$
    );

    this.loadingCtrl.dismiss();
  }

  async ngOnInit(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement...',
    });

    await loading.present();
    this._auth
      .getCurrentUser()
      .pipe(
        switchMap(async (user) => {
          if (user) {
            this.userID = user.uid;
            await this._dataService.loadSubData(user.uid);
            this.noSub = false;
          } else {
            this.noSub = true;
          }
          this.loadingCtrl.dismiss();
          return this._dataService.userSubData$;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((subs) => {
        this.userSubData$ = subs;
        this.monthlyExpenses$ = this._expensesService.getCurrentExpensesMonth(this.userSubData$);
        this.yearlyExpenses$ = this._expensesService.getCurrentExpensesYear(this.userSubData$);
      });
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Suppression...',
    });

    loading.present();
  }

  async handleRefresh(event: any) {
    try {
      const user = await firstValueFrom(this._auth.getCurrentUser());
      if (user) {
        await this._dataService.loadSubData(user.uid);
        // Réappliquer les filtres si nécessaire
        if (this.selectedCategory !== 'Tout' || this.selectedRenewal !== 'Tout') {
          await this.onFilterChange();
        }
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      event.target.complete();
    }
  }

  clearFilters() {
    this.selectedCategory = 'Tout';
    this.selectedRenewal = 'Tout';
    this.onFilterChange();
    this.noSub = false;
  }

  resetFilters() {
    this.clearFilters();
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

  getLogoUrl(sub: Subscription): string {
    if (sub.logo) {
      return sub.logo;
    }
    if (sub.domain) {
      return `https://logo.clearbit.com/${sub.domain}`;
    }
    // Fallback: générer un domaine à partir du nom
    const domainGuess = sub.companyName?.toLowerCase().replace(/\s+/g, '') + '.com';
    return `https://logo.clearbit.com/${domainGuess}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/icon/favicon.png';
  }
}
