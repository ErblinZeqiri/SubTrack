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
  series: number[] = [];
  labels: string[] = [];
  logoUrls: string[] = [];

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
    this.series = this.subData.map((sub) => sub.amount);
    this.labels = this.subData.map((sub) => sub.companyName);
    this.logoUrls = this.subData.map((sub) => sub.logo);

    this.chartOptions = {
      series: this.series,
      labels: this.labels,
      chart: {
        type: 'donut',
        width: '100%',
        dropShadow: {
          enabled: true,
          color: '#111',
          top: -1,
          left: 3,
          blur: 3,
          opacity: 0.2,
        },
        animations: {
          enabled: true,
          speed: 500,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 1000,
          },
        },
      } as ApexChart,
      plotOptions: {
        pie: {
          borderRadius: 10,
          startAngle: 0,
          endAngle: 360,
          expandOnClick: true,
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
                label: 'Total',
                fontSize: '25px',
                color: '#7C3AED',
                fontWeight: 700,
                formatter: (w: any) => {
                  const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return `${total} CHF`;
                },
              },
              value: {
                show: true,
                fontSize: '25px',
                formatter: (val: string) => `${val} CHF`,
              },
            },
          },
          customScale: 1,
        },
      } as ApexPlotOptions,
      stroke: {
        show: true,
        lineCap: 'round',
        width: 2,
      } as ApexStroke,
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '14px',
          colors: ['#ffffff'],
        },
        dropShadow: {
          blur: 3,
          opacity: 0.8,
        },
      } as ApexDataLabels,
      fill: {
        type: 'pattern',
        opacity: 1,
        pattern: {
          style: [],
        },
      } as ApexFill,
      states: {
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
        text: 'Résumé de vos abonnements',
        align: 'center',
        style: {
          fontSize: '20px',
          color: '#F1F5F9',
          fontWeight: 800,
          fontFamily: 'Lato, sans-serif',
        },
      } as ApexTitleSubtitle,
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        floating: false,
        fontSize: '14px',
        labels: {
          colors: '#F1F5F9',
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5,
        },
      } as ApexLegend,
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              width: '100%',
            },
            legend: {
              position: 'bottom',
              horizontalAlign: 'center',
            },
          },
        },
      ] as ApexResponsive[],
    };
  }
}
