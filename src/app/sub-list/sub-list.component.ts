import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Subscription, User } from '../../interfaces/interface';
import { ExepensesService } from '../services/expenses/exepenses.service';
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_RENEWAL_TYPES,
} from '../constants/subscription.constants';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
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
  filter,
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
    RouterLink,
  ],
  templateUrl: './sub-list.component.html',
  styleUrls: ['./sub-list.component.css', './expenses-summary.css', './sub-list-dark.component.css'],
  providers: [ExepensesService],
})
export class SubListComponent implements OnInit {
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;
  userSubData$!: Observable<Subscription[]>;
  totalAmount$!: Observable<number>;
  noSub: boolean = false;
  
  // Use imported constants instead of duplicating
  readonly subscriptionCategories = SUBSCRIPTION_CATEGORIES;
  readonly subscriptionRenewal = SUBSCRIPTION_RENEWAL_TYPES;
  selectedCategories: string[] = [];
  selectedRenewals: string[] = [];
  tempSelectedCategories: string[] = [];
  tempSelectedRenewals: string[] = [];
  userID!: string;
  private readonly destroyRef = inject(DestroyRef);

  get hasActiveFilters(): boolean {
    return this.selectedCategories.length > 0 || this.selectedRenewals.length > 0;
  }

  get categoryFilterCount(): number {
    return this.selectedCategories.length;
  }

  get renewalFilterCount(): number {
    return this.selectedRenewals.length;
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
    
    // Recharger les données quand on revient sur /home
    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        filter((event) => event.url === '/home' || event.url.startsWith('/home')),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.loadData();
      });
  }

  onFilterSelectionChange() {
    // Ne fait rien, juste pour mettre à jour les variables temporaires
  }

  async onCategoryDismiss() {
    if (this.areSameSelections(this.tempSelectedCategories, this.selectedCategories)) {
      return;
    }
    this.selectedCategories = [...this.tempSelectedCategories];
    await this.applyFilters();
  }

  async onRenewalDismiss() {
    if (this.areSameSelections(this.tempSelectedRenewals, this.selectedRenewals)) {
      return;
    }
    this.selectedRenewals = [...this.tempSelectedRenewals];
    await this.applyFilters();
  }

  private areSameSelections(first: string[], second: string[]): boolean {
    if (first.length !== second.length) {
      return false;
    }
    const firstSet = new Set(first);
    if (firstSet.size !== second.length) {
      return false;
    }
    return second.every((value) => firstSet.has(value));
  }

  async applyFilters() {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement...',
    });

    await loading.present();
    
    try {
      const filters = {
        categories: this.selectedCategories,
        renewals: this.selectedRenewals,
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
      this.totalAmount$ = this.userSubData$.pipe(
        map((subs) => this.calculateTotal(subs))
      );
      this.monthlyExpenses$ = this._expensesService.getCurrentExpensesMonth(
        this.userSubData$
      );
      this.yearlyExpenses$ = this._expensesService.getCurrentExpensesYear(
        this.userSubData$
      );
    } catch (error) {
      console.error('Erreur lors du filtrage:', error);
    } finally {
      await loading.dismiss();
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  private async loadData() {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement...',
    });

    await loading.present();
    this.tempSelectedCategories = [...this.selectedCategories];
    this.tempSelectedRenewals = [...this.selectedRenewals];
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
        this.totalAmount$ = this.userSubData$.pipe(
          map((items) => this.calculateTotal(items))
        );
        this.monthlyExpenses$ = this._expensesService.getCurrentExpensesMonth(this.userSubData$);
        this.yearlyExpenses$ = this._expensesService.getCurrentExpensesYear(this.userSubData$);
      });
  }

  private calculateTotal(subs: Subscription[]): number {
    return subs.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
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
        if (this.selectedCategories.length > 0 || this.selectedRenewals.length > 0) {
          await this.applyFilters();
        }
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      event.target.complete();
    }
  }

  async clearFilters() {
    this.selectedCategories = [];
    this.selectedRenewals = [];
    this.tempSelectedCategories = [];
    this.tempSelectedRenewals = [];
    await this.applyFilters();
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
