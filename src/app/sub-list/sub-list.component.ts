import { Component, OnInit } from '@angular/core';
import { Subscription, User } from '../../interfaces/interface';
import { ExepensesService } from '../services/expenses/exepenses.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  Firestore,
  collection,
  where,
  QueryConstraint,
  query,
  collectionData,
  documentId,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sub-list',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, IonicModule, RouterLink],
  templateUrl: './sub-list.component.html',
  styleUrl: './sub-list.component.css',
  providers: [ExepensesService],
})
export class SubListComponent implements OnInit {
  user?: User;
  subscriptions?: any;
  monthlyExpenses: number = 0;
  yearlyExpenses: number = 0;
  userToken: string = 'Nm9Nyy1KnHUqYcxU0ohXpjrCEoJ2';
  userData$: Observable<User[]> = this.loadUserData(this.userToken);
  userSubData$: Observable<Subscription[]> = this.loadSubData(this.userToken);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly expenses: ExepensesService,
    private readonly _router: Router,
    private readonly _firestore: Firestore
  ) {
    addIcons({});
  }

  ngOnInit(): void {
    // console.log(this._firestore);
    this.user = this.route.snapshot.data['data'];
    // console.log('User data:', this.user);
    // this.subscriptions = Object.entries(this.user!.subscriptions).map(
    //   ([key, value]) => ({
    //     id: key,
    //     ...value,
    //   })
    // );
    this.getMonthlyExpenses();
    this.getYearlyExpenses();
  }

  loadUserData(userToken: string) {
    const fbCollection = collection(this._firestore, 'users');
    const byUserId: QueryConstraint = where(documentId(), '==', userToken);
    const q = query(fbCollection, byUserId);
    const datas = collectionData(q, { idField: 'id' }) as Observable<User[]>;
    return datas;
  }

  loadSubData(userToken: string) {
    const fbCollection = collection(this._firestore, 'subscriptions');
    const byUserId: QueryConstraint = where('userID', '==', userToken);
    const q = query(fbCollection, byUserId);
    const datas = collectionData(q, { idField: 'id' }) as Observable<
      Subscription[]
    >;
    return datas;
  }

  // trackById(index: number, item: any): string {
  //   return item.id;
  // }

  getMonthlyExpenses() {
    this.monthlyExpenses = this.expenses.getCurrentExpensesMonth(
      this.subscriptions
    );
  }

  getYearlyExpenses() {
    this.yearlyExpenses = this.expenses.getCurrentExpensesYear(
      this.subscriptions
    );
  }

  handleClick(sub: any) {
    this._router.navigate(['/home/sub-details', sub.id]);
    console.log(sub);
  }
}
