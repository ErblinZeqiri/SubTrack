import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
  OnInit,
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
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { IonLoading } from '@ionic/angular/standalone';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  fill: any;
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
  public chartOptions!: Partial<ChartOptions> | any;
  @Input() subData!: any[];
  series: number[] = [];
  labels: string[] = [];
  logoUrls: string[] = [];

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['subData']) {
      this.updateChartData();
    }
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
          easing: 'easeinout',
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
      },
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
                color: '#043451',
                fontWeight: 700,
                formatter: (w: any) => {
                  const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return `${total} CHF`;
                },
              },
              value: {
                show: true,
                fontSize: '25px',
                formatter: (val: number) => `${val} CHF`,
              },
            },
          },
          customScale: 1,
        },
      },
      stroke: {
        show: true,
        lineCap: 'round',
        width: 2,
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '14px',
          colors: ['#f0f0f0'],
        },
        dropShadow: {
          blur: 3,
          opacity: 0.8,
        },
      },
      fill: {
        type: 'pattern',
        opacity: 1,
        pattern: {
          enabled: true,
          style: [],
        },
      },
      states: {
        hover: {
          filter: {
            type: 'none',
          },
        },
      },
      theme: {
        palette: 'palette1',
      },
      title: {
        text: 'Résumé de vos abonnements',
        align: 'center',
        style: {
          fontSize: '20px',
          color: '#043451',
          fontWeight: 800,
          fontFamily: 'Lato, sans-serif',
        },
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        floating: false,
        fontSize: '14px',
        labels: {
          colors: '#043451',
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5,
        },
      },
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
      ],
    };
  }
}
