import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import { Subscription } from '../../interfaces/interface';
import { SmartAmountPipe } from '../pipes/smart-amount.pipe';
import { UserPreferencesService } from '../services/preferences/user-preferences.service';
import { ExepensesService } from '../services/expenses/exepenses.service';
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_RENEWAL_TYPES,
} from '../constants/subscription.constants';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
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
  IonLoading,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { DonutChartComponent } from '../donut-chart/donut-chart.component';
import { addIcons } from 'ionicons';
import { funnelOutline, calendarOutline, close, createOutline, trashOutline } from 'ionicons/icons';
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
    IonLoading,
    RouterLink,
    SmartAmountPipe,
  ],
  templateUrl: './sub-list.component.html',
  styleUrls: ['./sub-list.component.css', './sub-list-dark.component.css'],
  providers: [ExepensesService],
})
export class SubListComponent implements OnInit, OnDestroy {
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;
  userSubData$!: Observable<Subscription[]>;
  totalAmount$!: Observable<number>;
  noSub: boolean = false;
  isFirstLoad: boolean = true;
  isUserScrolling = false;
  newSubId: string | null = null;
  private filterTouchStartX = 0;
  private filterTouchStartY = 0;

  // Use imported constants instead of duplicating
  readonly subscriptionCategories = SUBSCRIPTION_CATEGORIES;
  readonly subscriptionRenewal = SUBSCRIPTION_RENEWAL_TYPES;
  selectedCategories: string[] = [];
  selectedRenewals: string[] = [];
  userID!: string;
  private readonly destroyRef = inject(DestroyRef);
  private autoScrollTimer?: ReturnType<typeof setInterval>;
  private autoScrollDirection = 1;

  @ViewChildren('filterContainer') filterContainers!: QueryList<ElementRef>;
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

  readonly prefs = inject(UserPreferencesService);

  constructor(
    private readonly _dataService: DataService,
    private readonly _router: Router,
    private readonly _auth: AuthService,
    private readonly loadingCtrl: LoadingController,
    private readonly alertCtrl: AlertController,
    private readonly _expensesService: ExepensesService
  ) {
    addIcons({ funnelOutline, calendarOutline, close, createOutline, trashOutline });
  }

  onFilterTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.filterTouchStartX = event.touches[0].clientX;
      this.filterTouchStartY = event.touches[0].clientY;
    }
  }

  async openCategoryFilter(event?: Event) {
    if (event instanceof TouchEvent) {
      const touch = event.changedTouches[0];
      if (
        Math.abs(touch.clientX - this.filterTouchStartX) > 8 ||
        Math.abs(touch.clientY - this.filterTouchStartY) > 8
      ) return;
    }
    event?.preventDefault();
    event?.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Catégorie',
      inputs: this.subscriptionCategories.map(cat => ({
        type: 'checkbox' as const,
        label: cat,
        value: cat,
        checked: this.selectedCategories.includes(cat),
      })),
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Valider',
          handler: async (selected: string[]) => {
            this.selectedCategories = selected ?? [];
            await this.applyFilters();
          },
        },
      ],
    });
    await alert.present();
  }

  async openRenewalFilter(event?: Event) {
    if (event instanceof TouchEvent) {
      const touch = event.changedTouches[0];
      if (
        Math.abs(touch.clientX - this.filterTouchStartX) > 8 ||
        Math.abs(touch.clientY - this.filterTouchStartY) > 8
      ) return;
    }
    event?.preventDefault();
    event?.stopPropagation();
    const alert = await this.alertCtrl.create({
      header: 'Renouvellement',
      inputs: this.subscriptionRenewal.map(renewal => ({
        type: 'checkbox' as const,
        label: renewal,
        value: renewal,
        checked: this.selectedRenewals.includes(renewal),
      })),
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Valider',
          handler: async (selected: string[]) => {
            this.selectedRenewals = selected ?? [];
            await this.applyFilters();
          },
        },
      ],
    });
    await alert.present();
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
    if (this.selectedCategories.length > 0 || this.selectedRenewals.length > 0) {
      await this.applyFilters();
    }
    setTimeout(() => this.startAutoScroll(), 400);

    const navState = history.state;
    if (navState?.newSubId) {
      this.newSubId = navState.newSubId;
      setTimeout(() => {
        document.getElementById('sub-' + this.newSubId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { this.newSubId = null; }, 2200);
      }, 500);
    }
  }

  ionViewDidLeave(): void {
    this.stopAutoScroll();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  private startAutoScroll(): void {
    this.stopAutoScroll();
    this.autoScrollDirection = 1;

    const container = this.filterContainers?.first?.nativeElement as HTMLElement | undefined;
    if (!container) return;

    this.autoScrollTimer = setInterval(() => {
      if (this.isUserScrolling) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      container.scrollLeft += this.autoScrollDirection * 0.8;

      if (container.scrollLeft >= maxScroll) {
        this.autoScrollDirection = -1;
      } else if (container.scrollLeft <= 0) {
        this.autoScrollDirection = 1;
      }
    }, 16);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollTimer !== undefined) {
      clearInterval(this.autoScrollTimer);
      this.autoScrollTimer = undefined;
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
        this.isFirstLoad = false;
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
            const loading = await this.loadingCtrl.create({ message: 'Suppression...' });
            await loading.present();
            try {
              await this._dataService.deleteSub(sub);
              const user = await firstValueFrom(this._auth.getCurrentUser());
              if (user) {
                // Recharge la liste et force la mise à jour des totaux
                this.userSubData$ = this._dataService.loadSubData(user.uid);
                this.monthlyExpenses$ = this._expensesService.getCurrentExpensesMonth(this.userSubData$);
                this.yearlyExpenses$ = this._expensesService.getCurrentExpensesYear(this.userSubData$);
                this.totalAmount$ = this.userSubData$.pipe(map((items) => this.calculateTotal(items)));
              }
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
            } finally {
              await loading.dismiss();
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
