import { Injectable } from '@angular/core';
import { Subscription } from 'src/interfaces/interface';

export interface MonthData {
  year: number;
  month: number;       // 0-indexed
  label: string;       // ex. "Jan", "Fév"
  total: number;
  subCount: number;
}

export interface CategoryData {
  name: string;
  total: number;
  percent: number;
  color: string;
}

export interface Insight {
  icon: string;       // emoji
  text: string;       // texte principal (gras)
  sub?: string;       // texte secondaire (muted)
  type: 'neutral' | 'good' | 'warning' | 'alert';
}

const CATEGORY_COLORS: Record<string, string> = {
  'Divertissement': '#7c3aed',
  'Streaming':      '#a78bfa',
  'Indispensable':  '#3b82f6',
  'Presse':         '#f59e0b',
  'Fitness':        '#10b981',
  'Jeux':           '#f97316',
  'Cuisine':        '#ec4899',
  'Éducation':      '#06b6d4',
  'Technologie':    '#6366f1',
  'Mode':           '#e879f9',
  'Finance':        '#22c55e',
  'Voyage':         '#f43f5e',
};

const FALLBACK_COLORS = [
  '#7c3aed', '#3b82f6', '#10b981', '#f97316', '#a78bfa',
  '#ec4899', '#06b6d4', '#f59e0b',
];

const MONTH_SHORT = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
];

@Injectable({ providedIn: 'root' })
export class ReportsService {

  private toDate(value: any): Date {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value.toDate === 'function') return value.toDate(); // Firestore Timestamp
    return new Date(value);
  }

  getMonthPaymentAmount(sub: Subscription, year: number, month: number): number {
    const next = this.toDate(sub.nextPaymentDate);
    const monthDiff = (next.getFullYear() - year) * 12 + (next.getMonth() - month);
    const r = (sub.renewal ?? '').toLowerCase();

    if (r.includes('mensuel')) return sub.amount;
    if (r.includes('trimestr')) return ((monthDiff % 3) + 3) % 3 === 0 ? sub.amount : 0;
    if (r.includes('semest'))   return ((monthDiff % 6) + 6) % 6 === 0 ? sub.amount : 0;
    if (r.includes('annuel') || r.includes('annual'))
      return ((monthDiff % 12) + 12) % 12 === 0 ? sub.amount : 0;

    if (r.includes('hebdo') || r.includes('semaine')) {
      const dow = next.getDay();
      let count = 0;
      for (let d = 1; d <= new Date(year, month + 1, 0).getDate(); d++) {
        if (new Date(year, month, d).getDay() === dow) count++;
      }
      return sub.amount * count;
    }

    return sub.amount;
  }

  getMonthlyTotal(subs: Subscription[], year: number, month: number): number {
    return subs.reduce((sum, sub) => sum + this.getMonthPaymentAmount(sub, year, month), 0);
  }

  getActiveSubscriptions(subs: Subscription[], year: number, month: number): Subscription[] {
    return subs.filter(sub => this.getMonthPaymentAmount(sub, year, month) > 0);
  }

  getChartData(subs: Subscription[], year: number, month: number, count = 6): MonthData[] {
    const data: MonthData[] = [];
    for (let i = count - 1; i >= 0; i--) {
      let y = year;
      let m = month - i;
      while (m < 0) { m += 12; y--; }
      data.push({
        year: y,
        month: m,
        label: MONTH_SHORT[m],
        total: this.getMonthlyTotal(subs, y, m),
        subCount: this.getActiveSubscriptions(subs, y, m).length,
      });
    }
    return data;
  }

  getCategoryBreakdown(subs: Subscription[], year: number, month: number): CategoryData[] {
    const totals: Record<string, number> = {};
    let grandTotal = 0;

    for (const sub of subs) {
      const amount = this.getMonthPaymentAmount(sub, year, month);
      if (amount > 0) {
        totals[sub.category] = (totals[sub.category] ?? 0) + amount;
        grandTotal += amount;
      }
    }

    if (grandTotal === 0) return [];

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, total], i) => ({
        name,
        total,
        percent: Math.round((total / grandTotal) * 100),
        color: CATEGORY_COLORS[name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }));
  }

  getInsights(
    subs: Subscription[],
    year: number,
    month: number,
    currency: string,
  ): Insight[] {
    const insights: Insight[] = [];
    const currentTotal = this.getMonthlyTotal(subs, year, month);
    const activeSubs = this.getActiveSubscriptions(subs, year, month);

    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 0) { prevMonth = 11; prevYear--; }
    const prevTotal = this.getMonthlyTotal(subs, prevYear, prevMonth);
    const prevLabel = new Date(prevYear, prevMonth, 1)
      .toLocaleDateString('fr-FR', { month: 'long' });

    if (prevTotal > 0 && currentTotal > 0) {
      const diff = currentTotal - prevTotal;
      const pct  = Math.abs(Math.round((diff / prevTotal) * 100));
      if (diff > 0.01) {
        insights.push({
          icon: '📈',
          text: `Dépenses en hausse de ${pct}%`,
          sub: `+${diff.toFixed(2)} ${currency} par rapport à ${prevLabel}`,
          type: 'warning',
        });
      } else if (diff < -0.01) {
        insights.push({
          icon: '📉',
          text: `Dépenses en baisse de ${pct}%`,
          sub: `${diff.toFixed(2)} ${currency} économisé vs ${prevLabel}`,
          type: 'good',
        });
      } else {
        insights.push({
          icon: '✅',
          text: `Dépenses stables`,
          sub: `Aucun changement par rapport à ${prevLabel}`,
          type: 'neutral',
        });
      }
    }

    if (activeSubs.length > 0) {
      const top = activeSubs.reduce((a, b) =>
        this.getMonthPaymentAmount(a, year, month) >= this.getMonthPaymentAmount(b, year, month) ? a : b
      );
      const amt = this.getMonthPaymentAmount(top, year, month);
      const pct = currentTotal > 0 ? Math.round((amt / currentTotal) * 100) : 0;
      insights.push({
        icon: '💰',
        text: `${top.companyName} est votre plus grosse dépense`,
        sub: `${amt.toFixed(2)} ${currency} — ${pct}% du total ce mois`,
        type: 'alert',
      });
    }

    const cats = this.getCategoryBreakdown(subs, year, month);
    if (cats.length >= 2) {
      insights.push({
        icon: '🏷️',
        text: `${cats[0].name} domine ce mois`,
        sub: `${cats[0].total.toFixed(2)} ${currency} — ${cats[0].percent}% de vos dépenses`,
        type: 'neutral',
      });
    }

    let nextYear = year; let nextMonth = month + 1;
    if (nextMonth > 11) { nextMonth = 0; nextYear++; }
    const nextAnnual = subs.filter(s => {
      const r = (s.renewal ?? '').toLowerCase();
      return (r.includes('annuel') || r.includes('semest')) &&
        this.getMonthPaymentAmount(s, nextYear, nextMonth) > 0;
    });
    if (nextAnnual.length > 0) {
      const names = nextAnnual.slice(0, 2).map(s => s.companyName).join(', ');
      insights.push({
        icon: '📅',
        text: `Gros prélèvement le mois prochain`,
        sub: `${names}${nextAnnual.length > 2 ? ` et ${nextAnnual.length - 2} autres` : ''}`,
        type: 'alert',
      });
    }

    return insights;
  }

  formatMonthLabel(year: number, month: number): string {
    const date = new Date(year, month, 1);
    const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
}
