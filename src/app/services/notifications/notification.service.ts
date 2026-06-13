import { Injectable, inject } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Subscription } from 'src/interfaces/interface';
import { ReportsService } from '../reports/reports.service';

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

const PREFS_KEY         = 'notification_prefs';
const MONTHLY_REPORT_ID = 200000;
const TEST_NOTIF_ID     = 200001;
const TEST_REPORT_ID    = 200002;
const PRICE_ALERT_ID    = 300001;
const UNUSED_SUBS_ID    = 300002;
const OPTIM_TIPS_ID     = 300003;

interface NotifContent {
  title: string;
  body: string;
  largeBody?: string; // Android BigTextStyle — texte complet déplié
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private readonly reports = inject(ReportsService);

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
    // Supprimer les anciens canaux : Android ne met jamais à jour l'importance
    // d'un canal existant depuis le code — il faut supprimer puis recréer.
    try { await LocalNotifications.deleteChannel({ id: 'renewals' }); } catch {}
    try { await LocalNotifications.deleteChannel({ id: 'reports' });  } catch {}

    try {
      await LocalNotifications.createChannel({
        id: 'renewals',
        name: 'Rappels de renouvellement',
        description: 'Rappels avant chaque prélèvement',
        importance: 5,
        sound: 'default',
        vibration: true,
      });
      await LocalNotifications.createChannel({
        id: 'reports',
        name: 'Rapports mensuels',
        description: 'Résumé mensuel des dépenses',
        importance: 5,
        vibration: true,
      });
    } catch {}
  }

  async scheduleAll(prefs: NotificationPrefs, subscriptions: Subscription[], currency: string): Promise<void> {
    await this.cancelAll();
    if (!prefs.enabled || !(await this.hasPermission())) return;

    const now = new Date();
    const notifyHour = prefs.dndEnabled ? prefs.dndEnd : 9;
    const all: any[] = [];

    // ── Rappels de renouvellement ───────────────────────────────────────────────
    if (prefs.renewalReminders) {
      subscriptions.forEach((sub, si) => {
        if (!sub.nextPaymentDate) return;
        const payDate = new Date(sub.nextPaymentDate as any);

        prefs.daysBefore.forEach((days, di) => {
          const notifDate = new Date(payDate);
          notifDate.setDate(notifDate.getDate() - days);
          notifDate.setHours(notifyHour, 0, 0, 0);

          if (notifDate > now) {
            const { title, body, largeBody } = this.renewalContent(sub.companyName, sub.amount, currency, days);
            all.push({ id: si * 10 + di + 1, title, body, ...(largeBody ? { largeBody } : {}), schedule: { at: notifDate }, channelId: 'renewals' });
          }
        });
      });
    }

    // ── Rapport mensuel ─────────────────────────────────────────────────────────
    if (prefs.monthlyReport) {
      const nextReport = new Date();
      nextReport.setDate(prefs.reportDay);
      nextReport.setHours(9, 0, 0, 0);
      if (nextReport <= now) nextReport.setMonth(nextReport.getMonth() + 1);

      const { title, body, largeBody } = this.monthlyReportContent(subscriptions, now.getFullYear(), now.getMonth(), currency);
      all.push({ id: MONTHLY_REPORT_ID, title, body, largeBody, schedule: { at: nextReport }, channelId: 'reports' });
    }

    // ── Alertes de prix ─────────────────────────────────────────────────────────
    if (prefs.priceAlerts && subscriptions.length > 0) {
      const alertDate = new Date();
      alertDate.setDate(alertDate.getDate() + 14);
      alertDate.setHours(notifyHour, 0, 0, 0);

      const top = [...subscriptions].sort((a, b) => b.amount - a.amount)[0];
      all.push({
        id: PRICE_ALERT_ID,
        title: '🚨 Vérifiez vos tarifs',
        body: `${top.companyName} — ${top.amount} ${currency}/mois`,
        largeBody: `${top.companyName} — ${top.amount} ${currency}/mois\nLe tarif a-t-il changé récemment ?\nTouchez pour vérifier`,
        schedule: { at: alertDate },
        channelId: 'renewals',
      });
    }

    // ── Abonnements inutilisés ──────────────────────────────────────────────────
    if (prefs.unusedSubs && subscriptions.length > 0) {
      const unusedDate = new Date();
      unusedDate.setDate(unusedDate.getDate() + 30);
      unusedDate.setHours(notifyHour, 0, 0, 0);

      const count = subscriptions.length;
      all.push({
        id: UNUSED_SUBS_ID,
        title: '♻️ Abonnements à vérifier',
        body: `${count} abonnement${count !== 1 ? 's' : ''} actifs — certains inutilisés ?`,
        largeBody: `Tu as ${count} abonnement${count !== 1 ? 's' : ''} actifs\nCertains sont peut-être devenus inutiles\nTouchez pour les passer en revue`,
        schedule: { at: unusedDate },
        channelId: 'renewals',
      });
    }

    // ── Conseils d'optimisation ─────────────────────────────────────────────────
    if (prefs.optimizationTips && subscriptions.length > 0) {
      const tipDate = new Date();
      tipDate.setDate(tipDate.getDate() + 21);
      tipDate.setHours(notifyHour, 0, 0, 0);

      const { title, body, largeBody } = this.optimizationContent(subscriptions, now.getFullYear(), now.getMonth(), currency);
      all.push({ id: OPTIM_TIPS_ID, title, body, largeBody, schedule: { at: tipDate }, channelId: 'reports' });
    }

    if (all.length > 0) {
      await LocalNotifications.schedule({ notifications: all });
    }
  }

  async cancelAll(): Promise<void> {
    const { notifications } = await LocalNotifications.getPending();
    if (notifications.length > 0) {
      await LocalNotifications.cancel({ notifications });
    }
  }

  async sendTestReport(subscriptions: Subscription[], currency: string): Promise<boolean> {
    const granted = await this.requestPermission();
    if (!granted) return false;

    await LocalNotifications.cancel({ notifications: [{ id: TEST_REPORT_ID }] });

    const now = new Date();
    const { title, body, largeBody } = this.monthlyReportContent(subscriptions, now.getFullYear(), now.getMonth(), currency);

    await LocalNotifications.schedule({
      notifications: [{
        id: TEST_REPORT_ID,
        title,
        body,
        largeBody,
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

    await LocalNotifications.schedule({
      notifications: [{
        id: TEST_NOTIF_ID,
        title: '✅ SubTrack',
        body: 'Notifications activées avec succès !',
        schedule: { at: new Date(Date.now() + 5000) },
        channelId: 'renewals',
      }],
    });
    return true;
  }

  // ── Contenu des notifications ─────────────────────────────────────────────────

  private renewalContent(name: string, amount: number, currency: string, days: number): NotifContent {
    if (days === 1) {
      return {
        title: `⚠️ ${name}`,
        body:  `Renouvellement demain — ${amount} ${currency}`,
        largeBody: `Renouvellement demain — ${amount} ${currency}\nTouchez pour voir le détail`,
      };
    }
    return {
      title: `🔔 ${name}`,
      body:  `Se renouvelle dans ${days} jours — ${amount} ${currency}`,
    };
  }

  private monthlyReportContent(subs: Subscription[], year: number, month: number, currency: string): NotifContent {
    const currentTotal = this.reports.getMonthlyTotal(subs, year, month);
    const prevMonth    = month === 0 ? 11 : month - 1;
    const prevYear     = month === 0 ? year - 1 : year;
    const prevTotal    = this.reports.getMonthlyTotal(subs, prevYear, prevMonth);

    const monthLabel = this.capitalizedMonthYear(new Date(year, month, 1));
    const totalStr   = Math.round(currentTotal).toString();
    const count      = subs.length;
    const subLabel   = `${count} abonnement${count !== 1 ? 's' : ''}`;

    let evolutionShort = '';
    let evolutionFull  = '';

    if (prevTotal > 0) {
      const pct  = Math.round(((currentTotal - prevTotal) / prevTotal) * 100);
      const sign = pct >= 0 ? '+' : '';
      evolutionShort = ` · ${sign}${pct}% vs le mois dernier`;
      evolutionFull  = `\n${sign}${pct}% vs le mois dernier`;
    }

    return {
      title: `📊 Rapport ${monthLabel} prêt`,
      body:  `${totalStr} ${currency} • ${subLabel}${evolutionShort}`,
      largeBody: `${totalStr} ${currency} • ${subLabel}${evolutionFull}\nTouchez pour voir les détails`,
    };
  }

  private optimizationContent(subs: Subscription[], year: number, month: number, currency: string): NotifContent {
    const breakdown = this.reports.getCategoryBreakdown(subs, year, month);

    if (breakdown.length > 0) {
      const top = breakdown[0];
      return {
        title: '💡 Astuce économies',
        body:  `${top.name} : ${Math.round(top.total)} ${currency}/mois (${top.percent}%)`,
        largeBody: `${top.name} représente ${Math.round(top.total)} ${currency}/mois (${top.percent}%)\nVoulez-vous optimiser vos abonnements ?`,
      };
    }

    const total = subs.reduce((s, sub) => s + sub.amount, 0);
    return {
      title: '💡 Astuce économies',
      body:  `${Math.round(total)} ${currency}/mois en abonnements`,
      largeBody: `${Math.round(total)} ${currency}/mois en abonnements\nOuvrez SubTrack pour optimiser vos dépenses`,
    };
  }

  private capitalizedMonthYear(date: Date): string {
    const s = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
