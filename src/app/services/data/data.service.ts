import { Injectable } from '@angular/core';
import { User, Subscription } from '../../../interfaces/interface';
import { Observable } from 'rxjs';
import {
  collection,
  collectionData,
  doc,
  docData,
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

  constructor(private readonly _firestore: Firestore) {}

  loadUserData(userToken: string): Observable<User[]> {
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

  loadOneSubData(userToken: string, subId: string): Observable<Subscription| undefined> {
    const docRef = doc(this._firestore, `subscriptions/${subId}`);
    return docData(docRef, { idField: 'id' }) as Observable<Subscription | undefined>;
  }
}
