import { Injectable } from '@angular/core';
import { User, Subscription } from '../../../interfaces/interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  collection,
  collectionData,
  documentId,
  Firestore,
  query,
  QueryConstraint,
  where,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  user?: User;
  subscriptions?: Subscription[];
  monthlyExpenses: number = 0;
  yearlyExpenses: number = 0;
  userToken: string = 'Nm9Nyy1KnHUqYcxU0ohXpjrCEoJ2';
  userData$: Observable<User[]> = this.loadUserData(this.userToken);
  userSubData$: Observable<Subscription[]> = this.loadSubData(this.userToken);

  constructor(
    private readonly _http: HttpClient,
    private readonly _firestore: Firestore
  ) {}

  loadUserData(userToken: string): Observable<User[]>  {
    const fbCollection = collection(this._firestore, 'users');
    const byUserId: QueryConstraint = where(documentId(), '==', userToken);
    const q = query(fbCollection, byUserId);
    const datas = collectionData(q, { idField: 'id' }) as Observable<User[]>;
    return datas;
  }

  loadSubData(userToken: string): Observable<Subscription[]> {
    const fbCollection = collection(this._firestore, 'subscriptions');
    const byUserId: QueryConstraint = where('userID', '==', userToken);
    const q = query(fbCollection, byUserId);
    const datas = collectionData(q, { idField: 'id' }) as Observable<
      Subscription[]
    >;
    return datas;
  }
}
