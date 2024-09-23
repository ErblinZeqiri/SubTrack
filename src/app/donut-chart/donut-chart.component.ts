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
export class DonutChartComponent implements OnInit {
  public subData: Subscription[] = [];
  /**
   * Setter pour la propriété userSubData$.
   * Met à jour les données du graphique (subData) avec les données reçues.
   * Si les données sont présentes, met à jour le graphique via la méthode updateChart().
   * @param value un tableau de Subscription
   */
  @Input() set userSubData$(value: Subscription[]) {
    // On met en pause l'exécution de 2 secondes pour attendre que les données soient bien mises à jour
    setTimeout(() => {
      // On met à jour les données du graphique
      this.subData = value;
      console.log('Données reçues : ', value);

      // Si les données sont présentes, on met à jour le graphique
      if (this.subData && this.subData.length > 0) {
        this.updateChart();
      }
    }, 2000);
  }
  public chartOptions!: Partial<ChartOptions> | any;
  @ViewChild('chart') chart!: ChartComponent;

  ngOnInit(): void {}

  /**
   * Met à jour les données du graphique avec les données de la propriété userSubData$.
   * @returns void
   */
  updateChart() {
    let labels: string[] = [];
    let series: number[] = [];

    this.subData.forEach((sub) => {
      labels.push(sub.companyName);
      series.push(sub.amount);
    });

    console.log('Labels:', labels);
    console.log('Series:', series);

    this.chartOptions = {
      series: series,
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
      labels: labels,
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
  }
}
