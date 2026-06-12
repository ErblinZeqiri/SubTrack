import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Subscription } from 'src/interfaces/interface';

export interface NotificationPrefs {
  enabled: boolean;
  // Types
  renewalReminders: boolean;
  daysBefore: number[];
  monthlyReport: boolean;
  reportDay: number;
  priceAlerts: boolean;
  unusedSubs: boolean;
  optimizationTips: boolean;
  // Canaux
  emailEnabled: boolean;
  // Horaires
  dndEnabled: boolean;
  dndStart: number;
  dndEnd: number;
}

export const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  renewalReminders: true,
  daysBefore: [1, 3],
  monthlyReport: false,
  reportDay: 1,
  priceAlerts: false,
  unusedSubs: false,
  optimizationTips: false,
  emailEnabled: false,
  dndEnabled: true,
  dndStart: 22,
  dndEnd: 8,
};

const PREFS_KEY = 'notification_prefs';
const MONTHLY_REPORT_ID = 200000;
const TEST_NOTIF_ID    = 200001;
const TEST_REPORT_ID   = 200002;

@Injectable({ providedIn: 'root' })
export class NotificationService {

  async getPrefs(): Promise<NotificationPrefs> {
    const { value } = await Preferences.get({ key: PREFS_KEY });
    return value ? { ...DEFAULT_PREFS, ...JSON.parse(value) } : { ...DEFAULT_PREFS };
  }

  async savePrefs(prefs: NotificationPrefs): Promise<void> {
    await Preferences.set({ key: PREFS_KEY, value: JSON.stringify(prefs) });
  }

  async requestPermission(): Promise<boolean> {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  }

  async hasPermission(): Promise<boolean> {
    const { display } = await LocalNotifications.checkPermissions();
    return display === 'granted';
  }

  async createChannels(): Promise<void> {
    try {
      await LocalNotifications.createChannel({
        id: 'renewals',
        name: 'Rappels de renouvellement',
        description: 'Rappels avant chaque prélèvement',
        importance: 4,
        sound: 'default',
        vibration: true,
      });
      await LocalNotifications.createChannel({
        id: 'reports',
        name: 'Rapports mensuels',
        description: 'Résumé mensuel des dépenses',
        importance: 3,
      });
    } catch {
      // Les canaux existent peut-être déjà
    }
  }

  async scheduleAll(prefs: NotificationPrefs, subscriptions: Subscription[]): Promise<void> {
    await this.cancelAll();
    if (!prefs.enabled || !(await this.hasPermission())) return;

    const now = new Date();
    const notifyHour = prefs.dndEnabled ? prefs.dndEnd : 9;
    const allNotifications: any[] = [];

    // Rappels de renouvellement
    if (prefs.renewalReminders) {
      subscriptions.forEach((sub, subIndex) => {
        if (!sub.nextPaymentDate) return;
        const payDate = new Date(sub.nextPaymentDate);

        prefs.daysBefore.forEach((days, dayIndex) => {
          const notifDate = new Date(payDate);
          notifDate.setDate(notifDate.getDate() - days);
          notifDate.setHours(notifyHour, 0, 0, 0);

          if (notifDate > now) {
            allNotifications.push({
              id: subIndex * 10 + dayIndex + 1,
              title: `💳 ${sub.companyName}`,
              body: days === 1
                ? `Renouvellement demain — ${sub.amount} CHF`
                : `Renouvellement dans ${days} jours — ${sub.amount} CHF`,
              schedule: { at: notifDate },
              channelId: 'renewals',
            });
          }
        });
      });
    }

    // Rapport mensuel
    if (prefs.monthlyReport) {
      const nextReport = new Date();
      nextReport.setDate(prefs.reportDay);
      nextReport.setHours(9, 0, 0, 0);
      if (nextReport <= now) {
        nextReport.setMonth(nextReport.getMonth() + 1);
      }
      allNotifications.push({
        id: MONTHLY_REPORT_ID,
        title: '📊 Rapport mensuel SubTrack',
        body: 'Votre résumé des dépenses du mois est prêt.',
        schedule: { at: nextReport },
        channelId: 'reports',
      });
    }

    if (allNotifications.length > 0) {
      await LocalNotifications.schedule({ notifications: allNotifications });
    }
  }

  async cancelAll(): Promise<void> {
    const { notifications } = await LocalNotifications.getPending();
    if (notifications.length > 0) {
      await LocalNotifications.cancel({ notifications });
    }
  }

  async sendTestReport(subCount: number, monthlyTotal: number, currency: string): Promise<boolean> {
    const granted = await this.requestPermission();
    if (!granted) return false;

    await LocalNotifications.cancel({ notifications: [{ id: TEST_REPORT_ID }] });

    const now = new Date();
    const monthName = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const label = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const totalStr = monthlyTotal.toFixed(2).replace('.', '.');

    await LocalNotifications.schedule({
      notifications: [{
        id: TEST_REPORT_ID,
        title: '📊 Rapport mensuel SubTrack',
        body: `${label} — ${subCount} abonnement${subCount > 1 ? 's' : ''} · ${totalStr} ${currency}/mois`,
        schedule: { at: new Date(Date.now() + 3000) },
        channelId: 'reports',
      }],
    });
    return true;
  }

  async sendTest(): Promise<boolean> {
    const granted = await this.requestPermission();
    if (!granted) return false;

    await LocalNotifications.cancel({ notifications: [{ id: TEST_NOTIF_ID }] });

    const at = new Date(Date.now() + 5000);
    await LocalNotifications.schedule({
      notifications: [{
        id: TEST_NOTIF_ID,
        title: '🔔 SubTrack — Test',
        body: 'Les notifications fonctionnent correctement !',
        schedule: { at },
        channelId: 'renewals',
      }],
    });
    return true;
  }
}
