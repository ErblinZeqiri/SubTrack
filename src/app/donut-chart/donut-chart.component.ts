import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
  OnInit,
  ViewChild,
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
import { map, Observable, tap } from 'rxjs';
import { Subscription } from 'src/interfaces/interface';

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
  imports: [CommonModule, NgApexchartsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent implements OnInit {
  @Input() userSubData$!: Observable<Subscription[]>;
  public chartOptions!: Partial<ChartOptions> | any;
  @ViewChild('chart') chart!: ChartComponent;

  constructor() {}

  ngOnInit() {
    this.userSubData$
      .pipe(
        map((sub) => {
          let labels: string[] = [];
          let series: number[] = [];
          labels = sub.map((s) => s.companyName);
          series = sub.map((s) => s.amount);
          return { labels: labels, series: series };
        })
      )
      .forEach((result) => {
        console.log('Labels:', result.labels);
        console.log('Series:', result.series);
        this.chartOptions = {
          series: result.series,
          chart: {
            width: '30%',
            type: 'donut',
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
              easing: 'linear',
              speed: 500,
              animateGradually: {
                enabled: true,
                delay: 150,
              },
              dynamicAnimation: {
                enabled: true,
                speed: 350,
              },
            },
          },
          stroke: {
            width: 0,
          },
          plotOptions: {
            pie: {
              donut: {
                size: '70%',
                labels: {
                  show: true,
                  total: {
                    showAlways: true,
                    show: true,
                    label: 'Total',
                    fontSize: '14px',
                    color: '#555',
                  },
                },
              },
            },
          },
          labels: result.labels,
          dataLabels: {
            enabled: true,
            style: {
              fontSize: '12px',
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
            palette: 'palette2',
          },
          title: {
            text: 'Résumé de vos abonnements',
            align: 'center',
            floating: false,
            margin: 30,
            style: {
              fontSize: '16px',
              color: '#333',
            },
          },
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            floating: false,
            fontSize: '12px',
            offsetY: 20,
            itemMargin: {
              horizontal: 10,
              vertical: 5,
            },
          },
          responsive: [
            {
              breakpoint: 500,
              options: {
                chart: {
                  width: '99%',
                },
                title: {
                  text: 'Résumé de vos abonnements',
                  align: 'center',
                  margin: 20,
                  style: {
                    fontSize: '14px',
                    color: '#333',
                  },
                },
                legend: {
                  position: 'bottom',
                  horizontalAlign: 'center',
                  fontSize: '10px',
                  offsetY: 10,
                  itemMargin: {
                    horizontal: 5,
                    vertical: 5,
                  },
                },
                plotOptions: {
                  pie: {
                    donut: {
                      size: '50%',
                      labels: {
                        show: true,
                        total: {
                          showAlways: true,
                          show: true,
                          label: 'Total',
                          fontSize: '12px',
                        },
                      },
                    },
                  },
                },
                dataLabels: {
                  enabled: true,
                  style: {
                    fontSize: '10px',
                  },
                },
              },
            },
          ],
        };
      });
  }
}
