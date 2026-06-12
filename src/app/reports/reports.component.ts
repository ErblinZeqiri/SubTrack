import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton,
  ToastController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronForwardOutline, calendarOutline,
  analyticsOutline, trendingUpOutline, trendingDownOutline,
  downloadOutline,
} from 'ionicons/icons';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis,
  ApexTooltip, ApexFill, ApexStroke, ApexGrid, ApexDataLabels,
  ApexMarkers, ApexLegend, ApexNoData,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth/auth.service';
import { DataService } from '../services/data/data.service';
import { UserPreferencesService } from '../services/preferences/user-preferences.service';
import { ReportsService, MonthData, CategoryData, Insight } from '../services/reports/reports.service';
import { Subscription } from 'src/interfaces/interface';

export type AreaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  fill: ApexFill;
  stroke: ApexStroke;
  grid: ApexGrid;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  markers: ApexMarkers;
  legend: ApexLegend;
  noData: ApexNoData;
};

const MAX_VISIBLE_SUBS = 5;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton,
    CommonModule, NgApexchartsModule,
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {

  loading = true;
  subscriptions: Subscription[] = [];
  showAllSubs = false;

  displayYear  = new Date().getFullYear();
  displayMonth = new Date().getMonth();

  monthTotal  = 0;
  prevTotal   = 0;
  activeSubs: Subscription[] = [];
  categories: CategoryData[] = [];
  insights:   Insight[] = [];
  chartData:  MonthData[] = [];
  chartOptions: Partial<AreaChartOptions> = {};

  private readonly destroyRef  = inject(DestroyRef);
  private readonly auth        = inject(AuthService);
  private readonly dataService = inject(DataService);
  readonly prefs               = inject(UserPreferencesService);
  private readonly reports     = inject(ReportsService);
  private readonly toastCtrl   = inject(ToastController);

  constructor() {
    addIcons({
      chevronBackOutline, chevronForwardOutline, calendarOutline,
      analyticsOutline, trendingUpOutline, trendingDownOutline,
      downloadOutline,
    });
  }

  ngOnInit(): void {
    this.auth.getCurrentUser().pipe(
      switchMap(user => user ? this.dataService.loadSubData(user.uid) : of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(subs => {
      this.subscriptions = subs;
      this.compute();
      this.loading = false;
    });
  }

  prevMonth(): void {
    if (this.displayMonth === 0) { this.displayMonth = 11; this.displayYear--; }
    else { this.displayMonth--; }
    this.showAllSubs = false;
    this.compute();
  }

  nextMonth(): void {
    if (this.isCurrentMonth) return;
    if (this.displayMonth === 11) { this.displayMonth = 0; this.displayYear++; }
    else { this.displayMonth++; }
    this.showAllSubs = false;
    this.compute();
  }

  get isCurrentMonth(): boolean {
    const now = new Date();
    return this.displayYear === now.getFullYear() && this.displayMonth === now.getMonth();
  }

  get monthLabel(): string {
    return this.reports.formatMonthLabel(this.displayYear, this.displayMonth);
  }

  get prevMonthLabel(): string {
    let py = this.displayYear; let pm = this.displayMonth - 1;
    if (pm < 0) { pm = 11; py--; }
    return new Date(py, pm, 1).toLocaleDateString('fr-FR', { month: 'long' });
  }

  private compute(): void {
    const y    = this.displayYear;
    const m    = this.displayMonth;
    const subs = this.subscriptions;

    this.monthTotal = this.reports.getMonthlyTotal(subs, y, m);
    this.activeSubs = this.reports.getActiveSubscriptions(subs, y, m)
      .sort((a, b) =>
        this.reports.getMonthPaymentAmount(b, y, m) -
        this.reports.getMonthPaymentAmount(a, y, m)
      );
    this.categories = this.reports.getCategoryBreakdown(subs, y, m);
    this.insights   = this.reports.getInsights(subs, y, m, this.prefs.currency);
    this.chartData  = this.reports.getChartData(subs, y, m, 6);

    let py = y; let pm = m - 1;
    if (pm < 0) { pm = 11; py--; }
    this.prevTotal = this.reports.getMonthlyTotal(subs, py, pm);

    this.buildChart();
  }

  private buildChart(): void {
    const values = this.chartData.map(d => parseFloat(d.total.toFixed(2)));
    const labels = this.chartData.map(d => d.label);
    const currency = this.prefs.currency;

    this.chartOptions = {
      series: [{ name: 'Dépenses', data: values }],
      chart: {
        type: 'area',
        height: 220,
        toolbar: { show: false },
        background: 'transparent',
        animations: { enabled: true, speed: 700 },
        fontFamily: 'inherit',
        zoom: { enabled: false },
        selection: { enabled: false },
        pan: { enabled: false },
      } as any,
      fill: {
        type: 'gradient',
        gradient: {
          type: 'vertical',
          shadeIntensity: 0,
          opacityFrom: 0.5,
          opacityTo: 0.03,
          stops: [0, 95],
          colorStops: [
            { offset: 0,  color: '#7c3aed', opacity: 0.5 },
            { offset: 95, color: '#7c3aed', opacity: 0.03 },
          ],
        },
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        colors: ['#a78bfa'],
      },
      markers: {
        size: 4,
        colors: ['#7c3aed'],
        strokeColors: '#a78bfa',
        strokeWidth: 2,
        hover: { size: 7 },
      },
      xaxis: {
        categories: labels,
        labels: { style: { colors: '#64748b', fontSize: '11px', fontWeight: '500' } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { show: false },
      grid: {
        show: true,
        borderColor: 'rgba(255,255,255,0.06)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 8, right: 8, bottom: 0, left: 8 },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      noData: {
        text: 'Aucune donnée',
        style: { color: '#64748b', fontSize: '13px' },
      },
      tooltip: {
        theme: 'dark',
        x: { show: true },
        y: { formatter: (val: number) => `${val.toFixed(2)} ${currency}` },
        marker: { show: false },
      },
    };
  }

  readonly Math = Math;

  getSubAmount(sub: Subscription): number {
    return this.reports.getMonthPaymentAmount(sub, this.displayYear, this.displayMonth);
  }

  get visibleSubs(): Subscription[] {
    return this.showAllSubs ? this.activeSubs : this.activeSubs.slice(0, MAX_VISIBLE_SUBS);
  }

  get hasMoreSubs(): boolean {
    return this.activeSubs.length > MAX_VISIBLE_SUBS;
  }

  get diffPercent(): number {
    if (this.prevTotal === 0) return 0;
    return Math.round(((this.monthTotal - this.prevTotal) / this.prevTotal) * 100);
  }

  get diffAbsolute(): number {
    return Math.abs(this.monthTotal - this.prevTotal);
  }

  get diffClass(): 'up' | 'down' | 'stable' {
    if (this.monthTotal > this.prevTotal + 0.01) return 'up';
    if (this.monthTotal < this.prevTotal - 0.01) return 'down';
    return 'stable';
  }

  private readonly logoBaseUrl = 'https://img.logo.dev';
  private readonly logoDevToken = environment.logoDevToken;

  getLogoUrl(sub: Subscription): string {
    if (sub.logo) {
      if (sub.logo.includes('logo.clearbit.com')) {
        const domain = this.extractDomain(sub.logo);
        return domain ? this.buildLogoUrl(domain) : '';
      }
      if (sub.logo.includes('img.logo.dev') && !sub.logo.includes('token=')) {
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
      return url.split('?')[0].split('/').pop()?.trim().toLowerCase() ?? null;
    } catch { return null; }
  }

  onLogoError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  async onExport(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: '📄 Export PDF — bientôt disponible',
      duration: 2500,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }
}
