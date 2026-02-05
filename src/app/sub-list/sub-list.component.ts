import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Subscription } from '../../interfaces/interface';
import { ExepensesService } from '../services/expenses/exepenses.service';
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_RENEWAL_TYPES,
} from '../constants/subscription.constants';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom, map, Observable, of, switchMap, filter } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { AuthService } from '../services/auth/auth.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonRefresher,
  IonRefresherContent,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
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
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { funnelOutline, calendarOutline, close } from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';

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
  styleUrls: ['./sub-list.component.css', './sub-list-dark.component.css'],
  providers: [ExepensesService],
})
export class SubListComponent implements OnInit {
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;
  userSubData$!: Observable<Subscription[]>;
  totalAmount$!: Observable<number>;
  noSub: boolean = false;
  isFirstLoad: boolean = true;
  
  // Use imported constants instead of duplicating
  readonly subscriptionCategories = SUBSCRIPTION_CATEGORIES;
  readonly subscriptionRenewal = SUBSCRIPTION_RENEWAL_TYPES;
  selectedCategories: string[] = [];
  selectedRenewals: string[] = [];
  tempSelectedCategories: string[] = [];
  tempSelectedRenewals: string[] = [];
  userID!: string;
  private readonly destroyRef = inject(DestroyRef);
  private readonly logoBaseUrl = 'https://img.logo.dev';
  private readonly logoDevToken = environment.logoDevToken;

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
    private readonly _expensesService: ExepensesService
  ) {
    addIcons({ funnelOutline, calendarOutline, close });
    
    // Recharger les données seulement quand on navigue VERS /home depuis add-sub
    let previousUrl: string | null = null;
    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        if ((event.url === '/home' || event.url.startsWith('/home')) && previousUrl === '/add-sub') {
          this.loadData();
        }
        previousUrl = event.url;
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
    // Pas besoin de loading - filtrage instantan\u00e9 local
    try {
      // R\u00e9cup\u00e9rer toutes les donn\u00e9es utilisateur une seule fois
      const allSubs = await firstValueFrom(this._dataService.userSubData$);

      let filteredSubs: Subscription[] = [...allSubs];

      // Filtrer par cat\u00e9gorie localement
      if (this.selectedCategories.length > 0) {
        filteredSubs = filteredSubs.filter(sub => 
          this.selectedCategories.includes(sub.category)
        );
      }

      // Filtrer par renouvellement localement
      if (this.selectedRenewals.length > 0) {
        filteredSubs = filteredSubs.filter(sub => 
          this.selectedRenewals.includes(sub.renewal)
        );
      }

      const hasData = filteredSubs.length > 0;
      this.noSub = !hasData;
      this.userSubData$ = of(hasData ? filteredSubs : []);
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
      // En cas d'erreur, recharger toutes les donn\u00e9es
      this.loadData();
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadData(false);
    if (this.selectedCategories.length > 0 || this.selectedRenewals.length > 0) {
      await this.applyFilters();
    }
  }

  private async loadData(showLoading = true) {
    const loading = showLoading
      ? await this.loadingCtrl.create({
          message: 'Chargement...',
        })
      : null;

    if (loading) {
      await loading.present();
    }
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
          if (loading) {
            await loading.dismiss();
          }
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
      if (sub.logo.includes('logo.clearbit.com')) {
        const extractedDomain = this.extractDomainFromUrl(sub.logo);
        return extractedDomain ? this.buildLogoDevUrl(extractedDomain) : '';
      }
      if (sub.logo.includes('img.logo.dev') && !sub.logo.includes('token=')) {
        const extractedDomain = this.extractDomainFromUrl(sub.logo);
        return extractedDomain ? this.buildLogoDevUrl(extractedDomain) : '';
      }
      return sub.logo;
    }
    if (sub.domain) {
      return this.buildLogoDevUrl(sub.domain);
    }
    // Fallback: générer un domaine à partir du nom
    const domainGuess = sub.companyName?.toLowerCase().replace(/\s+/g, '') + '.com';
    return this.buildLogoDevUrl(domainGuess);
  }

  private buildLogoDevUrl(domain: string): string {
    if (!this.logoDevToken) {
      return '';
    }

    const safeDomain = domain.trim().toLowerCase();
    return `${this.logoBaseUrl}/${safeDomain}?token=${this.logoDevToken}&format=webp&retina=true&size=128`;
  }

  private extractDomainFromUrl(url: string): string | null {
    try {
      const cleanedUrl = url.split('?')[0];
      const lastSegment = cleanedUrl.split('/').pop();
      return lastSegment ? lastSegment.trim().toLowerCase() : null;
    } catch {
      return null;
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/icon/favicon.png';
  }
}
