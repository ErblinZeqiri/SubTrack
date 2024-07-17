import { Injectable } from '@angular/core';
import { User, Subscription } from '../../../interfaces/interface';
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

  constructor(
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
