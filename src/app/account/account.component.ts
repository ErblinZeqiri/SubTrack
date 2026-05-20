import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import {
  LoadingController,
  AlertController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonAlert,
  IonText,
  IonIcon,
} from '@ionic/angular/standalone';
import { Observable, map, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data/data.service';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { SmartAmountPipe } from '../pipes/smart-amount.pipe';
import { User } from '@angular/fire/auth';
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
} from 'ionicons/icons';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    IonIcon,
    IonText,
    IonAlert,
    IonButton,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    SmartAmountPipe,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  userData$: Observable<User | null>;
  subCount$!: Observable<number>;
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;

  private readonly authService = inject(AuthService);
  private readonly loadingCtrl = inject(LoadingController);
  private readonly alertCtrl = inject(AlertController);
  private readonly dataService = inject(DataService);
  private readonly expensesService = inject(ExepensesService);

  @ViewChild(IonAlert) alertRef?: IonAlert;

  public alertButtons = [
    { text: 'Non', role: 'cancel' },
    {
      text: 'Oui',
      role: 'confirm',
      handler: () => {
        this.alertRef?.dismiss();
        this.logout();
        return false;
      },
    },
  ];

  constructor() {
    this.userData$ = this.authService.getCurrentUser();
    addIcons({
      personOutline,
      mailOutline,
      calendarOutline,
      logOutOutline,
      trashOutline,
      cardOutline,
      statsChartOutline,
      chevronForwardOutline,
    });
  }

  ngOnInit(): void {
    const subs$ = this.dataService.userSubData$;
    this.subCount$ = subs$.pipe(map((subs) => subs.length));
    this.monthlyExpenses$ = this.expensesService.getCurrentExpensesMonth(subs$);
    this.yearlyExpenses$ = this.expensesService.getCurrentExpensesYear(subs$);
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
          handler: () => this.deleteAccount(),
        },
      ],
    });
    await alert.present();
  }

  private async deleteAccount(): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Suppression...' });
    await loading.present();
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Erreur suppression compte:', error);
    } finally {
      await loading.dismiss();
    }
  }

  private async logout(): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Déconnexion...' });
    await loading.present();
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      await loading.dismiss();
    }
  }
}
