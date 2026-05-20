import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import {
  LoadingController,
  AlertController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonToggle,
  IonAlert,
} from '@ionic/angular/standalone';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data/data.service';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { SmartAmountPipe } from '../pipes/smart-amount.pipe';
import { User } from '@angular/fire/auth';
import { Subscription } from '../../interfaces/interface';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  calendarOutline,
  logOutOutline,
  trashOutline,
  cardOutline,
  statsChartOutline,
  chevronForwardOutline,
  notificationsOutline,
  cashOutline,
  languageOutline,
  moonOutline,
  downloadOutline,
  createOutline,
  timeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    IonIcon,
    IonToggle,
    IonAlert,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    FormsModule,
    SmartAmountPipe,
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

  private readonly authService = inject(AuthService);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly alertCtrl = inject(AlertController);
  private readonly dataService = inject(DataService);
  private readonly expensesService = inject(ExepensesService);

  public logoutButtons = [
    { text: 'Annuler', role: 'cancel' },
    {
      text: 'Déconnexion',
      role: 'confirm',
      handler: () => this.logout(),
    },
  ];

  constructor() {
    this.userData$ = this.authService.getCurrentUser();
    addIcons({
      personOutline, mailOutline, calendarOutline, logOutOutline,
      trashOutline, cardOutline, statsChartOutline, chevronForwardOutline,
      notificationsOutline, cashOutline, languageOutline, moonOutline,
      downloadOutline, createOutline, timeOutline,
    });
  }

  ngOnInit(): void {
    const subs$ = this.dataService.userSubData$;
    this.subCount$ = subs$.pipe(map((s) => s.length));
    this.monthlyExpenses$ = this.expensesService.getCurrentExpensesMonth(subs$);
    this.yearlyExpenses$ = this.expensesService.getCurrentExpensesYear(subs$);
    this.lastSub$ = subs$.pipe(
      map((subs) => (subs.length > 0 ? subs[subs.length - 1] : null))
    );
  }

  getInitials(displayName: string | null | undefined): string {
    if (!displayName) return '?';
    return displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getCreationDate(user: User): string {
    const date = user.metadata?.creationTime;
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  async confirmDeleteAccount(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer le compte',
      message: 'Cette action est irréversible. Toutes vos données seront perdues.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          role: 'destructive',
          cssClass: 'alert-btn-danger',
          handler: () => this.logout(),
        },
      ],
    });
    await alert.present();
  }

  private async logout(): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Déconnexion...' });
    await loading.present();
    try {
      await this.authService.logout();
    } catch (e) {
      console.error(e);
    } finally {
      await loading.dismiss();
    }
  }
}
