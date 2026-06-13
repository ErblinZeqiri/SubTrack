import { Component, OnInit, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonIcon, IonButton, IonSpinner,
  ToastController, ModalController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline, closeCircleOutline, sparklesOutline,
  refreshOutline, infiniteOutline,
} from 'ionicons/icons';
import { PlanService } from '../services/plan/plan.service';
import { FREE_SUB_LIMIT, FREE_EXPORT_LIMIT } from '../services/plan/plan.service';

interface PricingPackage {
  id: string;
  label: string;
  price: string;
  pricePerMonth: string;
  badge?: string;
  rcPackage: any;
}

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonIcon, IonButton, IonSpinner,
    CommonModule,
  ],
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss'],
})
export class UpgradeComponent implements OnInit {
  packages: PricingPackage[] = [];
  selectedId = 'annual';
  loading = true;
  purchasing = false;
  restoring = false;

  readonly freeSubs   = FREE_SUB_LIMIT;
  readonly freeExport = FREE_EXPORT_LIMIT;

  readonly features = [
    { label: `Jusqu'à ${FREE_SUB_LIMIT} abonnements`,             free: true,  premium: 'Illimité' },
    { label: 'Export PDF / CSV / JSON',                            free: `${FREE_EXPORT_LIMIT}/mois`, premium: 'Illimité' },
    { label: 'Rapports détaillés + graphiques',                    free: false, premium: true },
    { label: 'Notifications avancées (1j / 3j / 7j)',             free: false, premium: true },
    { label: 'Alertes de prix & abonnements inutilisés',          free: false, premium: true },
    { label: 'Insights & recommandations',                         free: false, premium: true },
    { label: 'Sans publicité',                                     free: false, premium: true },
    { label: 'Support prioritaire',                                free: false, premium: true },
  ];

  private readonly planService = inject(PlanService);
  private readonly toastCtrl  = inject(ToastController);
  private readonly modalCtrl  = inject(ModalController);

  constructor() {
    addIcons({
      checkmarkCircleOutline, closeCircleOutline, sparklesOutline,
      refreshOutline, infiniteOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadOfferings();
  }

  private async loadOfferings(): Promise<void> {
    this.loading = true;
    try {
      const offerings = await this.planService.getOfferings();
      const current   = offerings?.current;

      if (current?.annual) {
        this.packages.push({
          id: 'annual',
          label: 'Annuel',
          price: current.annual.product.priceString,
          pricePerMonth: this.perMonth(current.annual.product.price),
          badge: '−33%',
          rcPackage: current.annual,
        });
      }
      if (current?.monthly) {
        this.packages.push({
          id: 'monthly',
          label: 'Mensuel',
          price: current.monthly.product.priceString,
          pricePerMonth: current.monthly.product.priceString,
          rcPackage: current.monthly,
        });
      }

      if (this.packages.length > 0 && !this.packages.find(p => p.id === this.selectedId)) {
        this.selectedId = this.packages[0].id;
      }
    } catch (e) {
      console.error('[Upgrade] loadOfferings', e);
    } finally {
      this.loading = false;
    }
  }

  private perMonth(annualPrice: number): string {
    return `${(annualPrice / 12).toFixed(2)} €`;
  }

  select(id: string): void {
    this.selectedId = id;
  }

  async purchase(): Promise<void> {
    const pkg = this.packages.find(p => p.id === this.selectedId);
    if (!pkg || this.purchasing) return;

    this.purchasing = true;
    try {
      const success = await this.planService.purchasePackage(pkg.rcPackage);
      if (success) {
        await this.showToast('🎉 Bienvenue dans SubTrack Premium !', 'success');
        await this.dismiss(true);
      }
    } catch (e: any) {
      await this.showToast("Une erreur est survenue lors de l'achat.", 'warning');
    } finally {
      this.purchasing = false;
    }
  }

  async restore(): Promise<void> {
    if (this.restoring) return;
    this.restoring = true;
    try {
      const success = await this.planService.restorePurchases();
      if (success) {
        await this.showToast('✅ Achats restaurés avec succès !', 'success');
        await this.dismiss(true);
      } else {
        await this.showToast('Aucun achat trouvé à restaurer.', 'dark');
      }
    } catch {
      await this.showToast('Erreur lors de la restauration.', 'warning');
    } finally {
      this.restoring = false;
    }
  }

  async dismiss(upgraded = false): Promise<void> {
    await this.modalCtrl.dismiss({ upgraded });
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({ message, duration: 3000, position: 'bottom', color });
    await toast.present();
  }
}
