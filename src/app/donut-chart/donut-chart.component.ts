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
  allSubscriptions: Subscription[] = []; // Tous les abonnements pour les chips
  
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
      // Désactiver les animations après le premier chargement
      if (this.isFirstLoad) {
        setTimeout(() => {
          this.isFirstLoad = false;
        }, 1200);
      }
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
    
    // Afficher TOUS les abonnements (pas seulement top 5)
    this.series = sortedSubs.map((sub) => sub.amount);
    this.labels = sortedSubs.map((sub) => sub.companyName);
    this.logoUrls = sortedSubs.map((sub) => sub.logo);
    
    // Sauvegarder TOUS les abonnements triés pour les chips
    this.allSubscriptions = sortedSubs;

    // Générer les couleurs pour tous les abonnements
    const baseColors = ['#7C3AED', '#A78BFA', '#6366F1', '#8B5CF6', '#C4B5FD', '#94A3B8'];
    const allColors = sortedSubs.map((_, index) => baseColors[index % baseColors.length]);
    this.originalFillColors = allColors;
    this.originalSeries = [...this.series];

    // Initialiser le texte du centre
    this.centerText = {
      title: `${this.allSubscriptions.length}`,
      subtitle: `Abonnement${this.allSubscriptions.length > 1 ? 's' : ''}`
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
        enabled: true,
        formatter: (val: number) => {
          return Math.round(val) + '%';
        },
        style: {
          fontSize: '11px',
          fontWeight: '600',
          colors: ['#fff']
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 2,
          opacity: 0.5
        }
      } as ApexDataLabels,
      fill: {
        type: 'solid',
        opacity: 1,
        colors: allColors,
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

    // Force change detection pour OnPush strategy
    this.cd.markForCheck();
  }

  getTotalAmount(): number {
    return this.subData.reduce((sum, sub) => sum + sub.amount, 0);
  }

  // Méthode pour gérer le click sur une chip
  onChipClick(index: number) {
    if (this.selectedSegmentIndex === index) {
      // Double click = reset
      this.resetSegmentHighlight();
    } else {
      this.selectedSegmentIndex = index;
      this.updateSegmentHighlight();
    }
  }

  private updateSegmentHighlight() {
    if (this.selectedSegmentIndex === null) return;

    const total = this.getTotalAmount();
    const selectedSub = this.allSubscriptions[this.selectedSegmentIndex];
    const percent = Math.round((selectedSub.amount / total) * 100);

    // Mettre à jour le texte central
    this.centerText = {
      title: selectedSub.companyName,
      subtitle: `${Math.round(selectedSub.amount)} CHF \u2022 ${percent}%`
    };

    // Créer l'effet de mise en avant: réduire l'opacité des autres segments SANS animation
    const baseColors = ['#7C3AED', '#A78BFA', '#6366F1', '#8B5CF6', '#C4B5FD', '#94A3B8'];
    const highlightedColors = baseColors.map((color, index) => {
      if (index === this.selectedSegmentIndex) {
        return color; // Couleur pleine pour le segment sélectionné
      }
      return color + '40'; // 40 = 25% d'opacité pour les autres
    });

    const currentOptions = this.chartOptions;
    this.chartOptions = {
      ...currentOptions,
      chart: {
        ...currentOptions.chart,
        animations: {
          enabled: false,
        }
      } as ApexChart,
      fill: {
        ...currentOptions.fill,
        colors: highlightedColors,
      }
    };

    this.cd.markForCheck();
  }

  resetSegmentHighlight() {
    this.selectedSegmentIndex = null;
    this.centerText = {
      title: `${this.allSubscriptions.length}`,
      subtitle: `Abonnement${this.allSubscriptions.length > 1 ? 's' : ''}`
    };

    // Réinitialiser les couleurs originales sans animation
    const currentOptions = this.chartOptions;
    this.chartOptions = {
      ...currentOptions,
      chart: {
        ...currentOptions.chart,
        animations: {
          enabled: false,
        }
      } as ApexChart,
      fill: {
        ...currentOptions.fill,
        colors: this.originalFillColors,
      }
    };

    this.cd.markForCheck();
  }

  getChipColor(index: number): string {
    const colors = ['#7C3AED', '#A78BFA', '#6366F1', '#8B5CF6', '#C4B5FD', '#94A3B8'];
    return colors[index % colors.length];
  }

  getPercentage(amount: number): number {
    const total = this.getTotalAmount();
    return Math.round((amount / total) * 100);
  }
}