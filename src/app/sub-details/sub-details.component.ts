import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { Subscription } from '../../interfaces/interface';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, calendarOutline, cashOutline, pricetagOutline,
  repeatOutline, hourglassOutline, timeOutline,
  createOutline, trashOutline,
} from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonHeader, IonToolbar, IonIcon, IonContent, IonTitle,
  IonButton, IonButtons, IonBackButton,
  AlertController, LoadingController,
} from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-sub-details',
  standalone: true,
  imports: [
    IonBackButton, IonButtons, IonButton, IonTitle,
    IonContent, IonIcon, IonToolbar, IonHeader,
    CommonModule,
  ],
  templateUrl: './sub-details.component.html',
  styleUrls: ['./sub-details.component.css'],
})
export class SubDetailsComponent implements OnInit {
  subscription$!: Observable<Subscription | undefined>;
  private subId: string = this._route.snapshot.params['id'];
  private readonly destroyRef = inject(DestroyRef);
  private readonly logoBaseUrl = 'https://img.logo.dev';
  private readonly logoDevToken = environment.logoDevToken;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _dataService: DataService,
    private readonly _router: Router,
    private readonly alertCtrl: AlertController,
    private readonly loadingCtrl: LoadingController,
  ) {
    addIcons({
      arrowBackOutline, calendarOutline, cashOutline, pricetagOutline,
      repeatOutline, hourglassOutline, timeOutline,
      createOutline, trashOutline,
    });
  }

  ngOnInit(): void {
    if (this.subId) {
      this.subscription$ = this._dataService
        .loadOneSubData(this.subId)
        .pipe(takeUntilDestroyed(this.destroyRef));
    }
  }

  isActive(sub: Subscription): boolean {
    if (!sub.deadline || sub.deadline === 'Indéterminée') return true;
    return new Date(sub.deadline) > new Date();
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getRecentPayments(sub: Subscription): string[] {
    return Object.keys(sub.paymentHistory).slice(-3).reverse();
  }

  getAnnualCost(sub: Subscription): number {
    const multipliers: Record<string, number> = {
      'Hebdomadaire': 52,
      'Mensuel': 12,
      'Trimestriel': 4,
      'Semestriel': 2,
      'Annuel': 1,
    };
    return sub.amount * (multipliers[sub.renewal] ?? 1);
  }

  getLogoUrl(sub: Subscription): string {
    if (sub.logo) {
      if (sub.logo.includes('logo.clearbit.com') || (sub.logo.includes('img.logo.dev') && !sub.logo.includes('token='))) {
        const domain = this.extractDomain(sub.logo);
        return domain ? this.buildLogoUrl(domain) : '';
      }
      return sub.logo;
    }
    if (sub.domain) return this.buildLogoUrl(sub.domain);
    return this.buildLogoUrl(sub.companyName.toLowerCase().replace(/\s+/g, '') + '.com');
  }

  private buildLogoUrl(domain: string): string {
    if (!this.logoDevToken) return '';
    return `${this.logoBaseUrl}/${domain.trim().toLowerCase()}?token=${this.logoDevToken}&format=webp&retina=true&size=128`;
  }

  private extractDomain(url: string): string | null {
    try {
      const segment = url.split('?')[0].split('/').pop();
      return segment?.trim().toLowerCase() ?? null;
    } catch {
      return null;
    }
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/icon/favicon.png';
  }

  editSubscription(sub: Subscription) {
    this._router.navigate(['/update', sub.id]);
  }

  async cancelSubscription(sub: Subscription) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmer la suppression',
      message: `Supprimer l'abonnement ${sub.companyName} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Suppression...' });
            await loading.present();
            try {
              await this._dataService.deleteSub(sub);
              this._router.navigate(['/home']);
            } finally {
              await loading.dismiss();
            }
          },
        },
      ],
    });
    await alert.present();
  }
}
