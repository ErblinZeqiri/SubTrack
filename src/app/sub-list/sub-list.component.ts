import { Component, OnInit } from '@angular/core';
import { Subscription, User } from '../../interfaces/interface';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { map, Observable, switchMap } from 'rxjs';
import { DataService } from '../services/data/data.service';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-sub-list',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, IonicModule, RouterLink],
  templateUrl: './sub-list.component.html',
  styleUrls: ['./sub-list.component.css'],
  providers: [ExepensesService],
})
export class SubListComponent implements OnInit {
  user?: User;
  subscriptions?: Subscription[];
  monthlyExpenses$!: Observable<number>;
  yearlyExpenses$!: Observable<number>;
  userToken: string = '';
  userData$!: Observable<User[]>;
  userSubData$!: Observable<Subscription[]>;
  credentials: string | null = localStorage.getItem('user');

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
      }
    }
  }

  handleClick(sub: any) {
    this._router.navigate(['/home/sub-details', sub.id]);
  }
}
