import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription, User } from '../../interfaces/interface';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { map, Observable } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { AuthService } from '../services/auth/auth.service';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-sub-list',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    IonicModule,
    RouterLink,
    ChartModule,
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

  constructor(
    private readonly expenses: ExepensesService,
    private readonly firestore: DataService,
    private readonly _router: Router,
    private readonly _auth: AuthService
  ) {
    addIcons({});
  }

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

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');

        let labels: string[] = [];
        let data: number[] = [];

        this.userSubData$.subscribe((subscriptions) => {
          subscriptions.forEach((sub) => {
            labels.push(sub.companyName);
            data.push(sub.amount);
          });

          this.data = {
            labels: labels,
            datasets: [
              {
                data: data,
                backgroundColor: [
                  documentStyle.getPropertyValue('--blue-500') || '#FF6384',
                  documentStyle.getPropertyValue('--yellow-500') || '#36A2EB',
                  documentStyle.getPropertyValue('--green-500') || '#FFCE56',
                ],
                hoverBackgroundColor: [
                  documentStyle.getPropertyValue('--blue-400') || '#FF6384',
                  documentStyle.getPropertyValue('--yellow-400') || '#36A2EB',
                  documentStyle.getPropertyValue('--green-400') || '#FFCE56',
                ],
              },
            ],
          };

          this.options = {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true,
                  color: textColor,
                },
              },
            },
          };
        });
      }
    }
  }

  handleClick(sub: any) {
    this._router.navigate(['/home/sub-details', sub.id]);
  }
}
