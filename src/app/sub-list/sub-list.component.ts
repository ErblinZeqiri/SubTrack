import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription, User } from '../../interfaces/interface';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { map, Observable } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { AuthService } from '../services/auth/auth.service';
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
} from 'ng-apexcharts';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';

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
  selector: 'app-sub-list',
  standalone: true,
  imports: [
    IonLabel,
    IonItem,
    IonList,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    NgApexchartsModule,
  ],
  templateUrl: './sub-list.component.html',
  styleUrls: ['./sub-list.component.css'],
  providers: [ExepensesService],
})
export class SubListComponent implements OnInit {
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;
  userToken: string = '';
  userData$!: Observable<User[]>;
  userSubData$!: Observable<Subscription[]>;
  credentials: string | null = localStorage.getItem('user');
  data: any;
  options: any;
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions> | any;

  constructor(
    private readonly expenses: ExepensesService,
    private readonly firestore: DataService,
    private readonly _router: Router,
    private readonly _auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this._auth.isAuthenticated()) {
      if (this.credentials !== null) {
        const localStorageData: any = JSON.parse(this.credentials);
        this.userToken = localStorageData.uid;
        this.userData$ = this.firestore.loadUserData(localStorageData.uid);
        this.userSubData$ = this.firestore.loadSubData(localStorageData.uid);
        this.monthlyExpenses$ = this.userSubData$.pipe(
          map((userSubData) =>
            this.expenses.getCurrentExpensesMonth(userSubData)
          )
        );
        this.yearlyExpenses$ = this.userSubData$.pipe(
          map((userSubData) =>
            this.expenses.getCurrentExpensesYear(userSubData)
          )
        );

        let labels: string[] = [];
        let series: number[] = [];

        this.userSubData$.subscribe((subscriptions) => {
          subscriptions.forEach((sub) => {
            labels.push(sub.companyName);
            series.push(sub.amount);
          });
        });

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
            text: 'Favourite Movie Type',
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
                  text: 'Favourite Movie Type',
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
  }

  handleClick(sub: any) {
    this._router.navigate(['/home/sub-details', sub.id]);
  }
}
