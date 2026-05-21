import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import {
  LoadingController,
  AlertController,
  ToastController,
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonToggle,
} from '@ionic/angular/standalone';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data/data.service';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { UserPreferencesService } from '../services/preferences/user-preferences.service';
import { CurrencyPickerComponent } from '../currency-picker/currency-picker.component';
import { SmartAmountPipe } from '../pipes/smart-amount.pipe';
import { User } from '@angular/fire/auth';
import { Subscription } from '../../interfaces/interface';
import { addIcons } from 'ionicons';
import {
  personOutline, mailOutline, calendarOutline, logOutOutline,
  trashOutline, cardOutline, statsChartOutline, chevronForwardOutline,
  notificationsOutline, cashOutline, languageOutline, moonOutline,
  downloadOutline, createOutline, timeOutline, checkmarkOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    IonIcon, IonToggle, IonContent, IonTitle, IonToolbar, IonHeader,
    CommonModule, FormsModule, SmartAmountPipe,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  userData$!: Observable<User | null>;
  subCount$!: Observable<number>;
  lastSub$!: Observable<Subscription | null>;
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;

  darkMode = true;

  private readonly authService        = inject(AuthService);
  private readonly loadingCtrl        = inject(LoadingController);
  private readonly alertCtrl          = inject(AlertController);
  private readonly toastCtrl          = inject(ToastController);
  private readonly modalCtrl          = inject(ModalController);
  private readonly dataService        = inject(DataService);
  private readonly expensesService    = inject(ExepensesService);
  readonly prefs                      = inject(UserPreferencesService);

  constructor() {
    this.userData$ = this.authService.getCurrentUser();
    addIcons({
      personOutline, mailOutline, calendarOutline, logOutOutline,
      trashOutline, cardOutline, statsChartOutline, chevronForwardOutline,
      notificationsOutline, cashOutline, languageOutline, moonOutline,
      downloadOutline, createOutline, timeOutline, checkmarkOutline,
    });
  }

  ngOnInit(): void {
    const subs$ = this.dataService.userSubData$;
    this.subCount$        = subs$.pipe(map((s) => s.length));
    this.monthlyExpenses$ = this.expensesService.getCurrentExpensesMonth(subs$);
    this.yearlyExpenses$  = this.expensesService.getCurrentExpensesYear(subs$);
    this.lastSub$         = subs$.pipe(map((s) => s.length > 0 ? s[s.length - 1] : null));
  }

  async openCurrencyPicker(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CurrencyPickerComponent,
      componentProps: { selectedCurrency: this.prefs.currency },
      breakpoints: [0, 0.75, 1],
      initialBreakpoint: 0.75,
      cssClass: 'currency-picker-modal',
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      await this.prefs.setCurrency(data);
    }
  }

  getInitials(displayName: string | null | undefined): string {
    if (!displayName) return '?';
    return displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getCreationDate(user: User): string {
    const date = user.metadata?.creationTime;
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-CH', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  async confirmLogout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Se déconnecter ?',
      message: 'Vous devrez vous reconnecter pour accéder à vos données.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Déconnexion', role: 'confirm', handler: () => this.logout() },
      ],
    });
    await alert.present();
  }

  async showComingSoon(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: '🚧 Fonctionnalité à venir',
      duration: 1800,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }

  async confirmDeleteAccount(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer le compte',
      message: 'Cette action est irréversible. Tous vos abonnements et données seront définitivement supprimés.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer définitivement',
          role: 'destructive',
          handler: () => this.deleteAccount(),
        },
      ],
    });
    await alert.present();
  }

  private async deleteAccount(): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Suppression du compte...' });
    await loading.present();
    try { await this.authService.deleteAccount(); }
    catch (e) { console.error(e); }
    finally { await loading.dismiss(); }
  }

  private async logout(): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Déconnexion...' });
    await loading.present();
    try { await this.authService.logout(); }
    catch (e) { console.error(e); }
    finally { await loading.dismiss(); }
  }
}
