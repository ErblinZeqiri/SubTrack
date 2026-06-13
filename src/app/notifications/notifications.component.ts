import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonToggle, IonIcon, IonSpinner,
  IonSelect, IonSelectOption, IonButton, IonItem,
  ToastController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, mailOutline, phonePortraitOutline,
  moonOutline, calendarOutline, cashOutline, analyticsOutline,
  checkmarkCircleOutline, timeOutline, sparklesOutline, refreshOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { AuthService } from '../services/auth/auth.service';
import { DataService } from '../services/data/data.service';
import {
  NotificationService,
  NotificationPrefs,
  DEFAULT_PREFS,
} from '../services/notifications/notification.service';
import { UserPreferencesService } from '../services/preferences/user-preferences.service';
import { Subscription } from 'src/interfaces/interface';
import { of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonToggle, IonIcon, IonSpinner,
    IonSelect, IonSelectOption, IonButton, IonItem,
    CommonModule, FormsModule,
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  prefs: NotificationPrefs = { ...DEFAULT_PREFS };
  permissionGranted = false;
  loading = true;
  testing = false;
  testSuccess = false;
  testingReport = false;
  testReportSuccess = false;
  subscriptions: Subscription[] = [];

  readonly daysOptions = [
    { value: 1, label: '1 jour avant' },
    { value: 3, label: '3 jours avant' },
    { value: 7, label: '7 jours avant' },
  ];
  readonly reportDayOptions = [1, 5, 10, 15, 20, 25];
  readonly hours = Array.from({ length: 24 }, (_, i) => i);

  private readonly destroyRef = inject(DestroyRef);
  private readonly notifService = inject(NotificationService);
  private readonly toastCtrl = inject(ToastController);
  private readonly prefs_ = inject(UserPreferencesService);
  private readonly auth = inject(AuthService);
  private readonly dataService = inject(DataService);

  constructor() {
    addIcons({
      notificationsOutline, mailOutline, phonePortraitOutline,
      moonOutline, calendarOutline, cashOutline, analyticsOutline,
      checkmarkCircleOutline, timeOutline, sparklesOutline, refreshOutline,
      chevronForwardOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.prefs = await this.notifService.getPrefs();
    this.permissionGranted = await this.notifService.hasPermission();
    await this.notifService.createChannels();

    this.auth.getCurrentUser().pipe(
      switchMap(user => user ? this.dataService.loadSubData(user.uid) : of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(subs => {
      this.subscriptions = subs;
      this.loading = false;
    });
  }

  isDaySelected(day: number): boolean {
    return this.prefs.daysBefore.includes(day);
  }

  toggleDay(day: number): void {
    if (this.isDaySelected(day)) {
      if (this.prefs.daysBefore.length > 1) {
        this.prefs.daysBefore = this.prefs.daysBefore.filter(d => d !== day);
      }
    } else {
      this.prefs.daysBefore = [...this.prefs.daysBefore, day].sort((a, b) => a - b);
    }
    this.onSave();
  }

  async onMainToggle(): Promise<void> {
    if (this.prefs.enabled && !this.permissionGranted) {
      this.permissionGranted = await this.notifService.requestPermission();
      if (!this.permissionGranted) {
        this.prefs.enabled = false;
        return;
      }
    }
    if (!this.prefs.enabled) {
      await this.notifService.cancelAll();
      await this.notifService.savePrefs(this.prefs);
      return;
    }
    await this.onSave();
  }

  async onSave(): Promise<void> {
    await this.notifService.savePrefs(this.prefs);
    await this.notifService.scheduleAll(this.prefs, this.subscriptions, this.prefs_.currency);
  }

  async requestPermission(): Promise<void> {
    this.permissionGranted = await this.notifService.requestPermission();
    if (this.permissionGranted && this.prefs.enabled) {
      await this.onSave();
    }
  }

  async sendTest(): Promise<void> {
    this.testing = true;
    const success = await this.notifService.sendTest();
    this.testing = false;

    if (success) {
      this.testSuccess = true;
      setTimeout(() => { this.testSuccess = false; }, 3000);
      const toast = await this.toastCtrl.create({
        message: 'Notification de test envoyée dans 5 secondes',
        duration: 2500,
        position: 'bottom',
        color: 'dark',
      });
      await toast.present();
    } else {
      this.permissionGranted = false;
      const toast = await this.toastCtrl.create({
        message: 'Permission refusée. Activez les notifications dans les paramètres système.',
        duration: 3500,
        position: 'bottom',
        color: 'warning',
      });
      await toast.present();
    }
  }

  formatReportDay(d: number): string {
    return d === 1 ? '1er de chaque mois' : `${d}ème de chaque mois`;
  }

  async sendTestReport(): Promise<void> {
    this.testingReport = true;
    const success = await this.notifService.sendTestReport(
      this.subscriptions,
      this.prefs_.currency,
    );
    this.testingReport = false;

    if (success) {
      this.testReportSuccess = true;
      setTimeout(() => { this.testReportSuccess = false; }, 3000);
      const toast = await this.toastCtrl.create({
        message: 'Rapport de test envoyé dans 3 secondes',
        duration: 2500,
        position: 'bottom',
        color: 'dark',
      });
      await toast.present();
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Permission refusée. Activez les notifications dans les paramètres système.',
        duration: 3500,
        position: 'bottom',
        color: 'warning',
      });
      await toast.present();
    }
  }

  get selectedDaysLabel(): string {
    const sorted = [...this.prefs.daysBefore].sort((a, b) => b - a);
    return sorted.map(d => d === 1 ? '1 jour' : `${d} jours`).join(' et ');
  }

  formatHour(h: number): string {
    return `${h.toString().padStart(2, '0')}h00`;
  }
}
