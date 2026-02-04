import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  SimpleChanges,
  OnChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexStroke,
  ApexPlotOptions,
  ApexStates,
  ApexTheme,
  ApexTitleSubtitle,
  ApexFill,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { IonLoading } from '@ionic/angular/standalone';
import { Subscription } from '../../interfaces/interface';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  fill: ApexFill;
  stroke: ApexStroke;
  states: ApexStates;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  theme: ApexTheme;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-donut-chart',
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.scss'],
  standalone: true,
  imports: [IonLoading, CommonModule, NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent implements OnChanges {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  @Input() subData: Subscription[] = [];
  @Input() isFirstLoad: boolean = true;
  series: number[] = [];
  labels: string[] = [];
  logoUrls: string[] = [];
  
  // Variables pour l'interactivité
  selectedSegmentIndex: number | null = null;
  centerText = { title: '', subtitle: '' };
  originalSeries: number[] = [];
  originalFillColors: string[] = [];

  constructor(private cd: ChangeDetectorRef) {
    this.chartOptions = this.initChartOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['subData']) {
      this.updateChartData();
    }
  }

  private initChartOptions(): Partial<ChartOptions> {
    return {
      series: [],
      labels: [],
      chart: { type: 'donut' } as ApexChart,
      fill: {} as ApexFill,
      stroke: {} as ApexStroke,
      states: {} as ApexStates,
      legend: {} as ApexLegend,
      title: {} as ApexTitleSubtitle,
      theme: {} as ApexTheme,
      plotOptions: {} as ApexPlotOptions,
      dataLabels: {} as ApexDataLabels,
      responsive: [] as ApexResponsive[],
    };
  }

  private updateChartData() {
    // Trier par montant décroissant
    const sortedSubs = [...this.subData].sort((a, b) => b.amount - a.amount);
    
    // Garder les 5 plus gros, regrouper le reste en "Autres"
    const topSubs = sortedSubs.slice(0, 5);
    const otherSubs = sortedSubs.slice(5);
    
    this.series = topSubs.map((sub) => sub.amount);
    this.labels = topSubs.map((sub) => sub.companyName);
    this.logoUrls = topSubs.map((sub) => sub.logo);
    
    // Ajouter "Autres" si nécessaire
    if (otherSubs.length > 0) {
      const otherTotal = otherSubs.reduce((sum, sub) => sum + sub.amount, 0);
      this.series.push(otherTotal);
      this.labels.push('Autres');
      this.logoUrls.push('');
    }

    // Sauvegarder les couleurs originales pour reset
    this.originalFillColors = ['#7C3AED', '#A78BFA', '#6366F1', '#8B5CF6', '#C4B5FD', '#94A3B8'];
    this.originalSeries = [...this.series];

    // Initialiser le texte du centre
    const total = this.getTotalAmount();
    this.centerText = {
      title: `${Math.round(total)} CHF`,
      subtitle: 'Abonnements actifs'
    };
    this.selectedSegmentIndex = null;

    this.chartOptions = {
      series: this.series,
      labels: this.labels,
      chart: {
        type: 'donut',
        width: '100%',
        dropShadow: {
          enabled: false,
        },
        animations: {
          enabled: this.isFirstLoad,
          speed: 800,
          animateGradually: {
            enabled: this.isFirstLoad,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: false,
          },
        },
      } as ApexChart,
      plotOptions: {
        pie: {
          borderRadius: 8,
          startAngle: 0,
          endAngle: 360,
          expandOnClick: false,
          donut: {
            size: '75%',
            labels: {
              show: false,
            },
          },
          customScale: 1,
        },
      } as ApexPlotOptions,
      stroke: {
        show: true,
        width: 1.5,
        colors: ['rgba(255, 255, 255, 0.12)'],
      } as ApexStroke,
      dataLabels: {
        enabled: false,
      } as ApexDataLabels,
      fill: {
        type: 'solid',
        opacity: 1,
        colors: ['#7C3AED', '#A78BFA', '#6366F1', '#8B5CF6', '#C4B5FD', '#94A3B8'],
      } as ApexFill,
      states: {
        active: {
          filter: {
            type: 'none',
          },
        },
        hover: {
          filter: {
            type: 'none',
          },
        },
      } as ApexStates,
      theme: {
        palette: 'palette1',
      } as ApexTheme,
      title: {
        text: '',
      } as ApexTitleSubtitle,
      legend: {
        show: false,
      } as ApexLegend,
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              width: '100%',
            },
            legend: {
              show: false,
            },
          },
        },
      ] as ApexResponsive[],
    };
  }

  // Méthodes pour la légende personnalisée
  getChipColor(index: number): string {
    const colors = ['#7C3AED', '#A78BFA', '#6366F1', '#8B5CF6', '#C4B5FD', '#64748B'];
    return colors[index] || colors[colors.length - 1];
  }

  getPercentage(index: number): string {
    const total = this.series.reduce((sum, val) => sum + val, 0);
    const percent = (this.series[index] / total) * 100;
    return percent.toFixed(0);
  }

  getTotalAmount(): number {
    return this.series.reduce((sum, val) => sum + val, 0);
  }

  // Méthode pour gérer le tap sur une chip
  onChipTap(index: number) {
    if (this.selectedSegmentIndex === index) {
      // Double tap = reset
      this.resetSegmentHighlight();
    } else {
      this.selectedSegmentIndex = index;
      this.updateSegmentHighlight();
    }
  }

  private updateSegmentHighlight() {
    if (this.selectedSegmentIndex === null) return;

    const total = this.getTotalAmount();
    const selectedAmount = this.series[this.selectedSegmentIndex];
    const selectedLabel = this.labels[this.selectedSegmentIndex];
    const percent = Math.round((selectedAmount / total) * 100);

    // Mettre à jour le texte central
    this.centerText = {
      title: `${Math.round(selectedAmount)} CHF`,
      subtitle: `${percent}% - ${selectedLabel}`
    };

    // On ne modifie plus les couleurs - la CSS du brightness gère l'effet visuel
    this.cd.markForCheck();
  }

  resetSegmentHighlight() {
    this.selectedSegmentIndex = null;
    this.centerText = {
      title: `${Math.round(this.getTotalAmount())} CHF`,
      subtitle: 'Abonnements actifs'
    };

    // On ne restore pas les couleurs - elles n'ont jamais été changées
    this.cd.markForCheck();
  }
}