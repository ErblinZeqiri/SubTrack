import { Injectable } from '@angular/core';
import { User, Subscription } from '../../../interfaces/interface';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
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
import { deleteDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private userSubDataSubject = new BehaviorSubject<Subscription[]>([]);
  userSubData$ = this.userSubDataSubject.asObservable();
  private userDataSubject = new BehaviorSubject<User[]>([]);
  userData$ = this.userDataSubject.asObservable();

  constructor(private readonly _firestore: Firestore) {}

  loadUserData(userID: string): Observable<User[]> {
    this.userDataSubject.next([]);

    const fbCollection = collection(this._firestore, 'users');
    const byUserId: QueryConstraint = where(documentId(), '==', userID);
    const q = query(fbCollection, byUserId);
    const datas = collectionData(q, { idField: 'id' }) as Observable<User[]>;
    return datas.pipe(tap((data) => this.userDataSubject.next(data)));
  }

  loadSubData(userID: string): Observable<Subscription[]> {
    this.userSubDataSubject.next([]);

    const fbCollection = collection(this._firestore, 'subscriptions');
    const byUserId: QueryConstraint = where('userID', '==', userID);
    const q = query(fbCollection, byUserId);
    const datas = collectionData(q, { idField: 'id' }) as Observable<
      Subscription[]
    >;
    return datas.pipe(tap((data) => this.userSubDataSubject.next(data)));
  }

  loadOneSubData(subId: string): Observable<Subscription | undefined> {
    const docRef = doc(this._firestore, `subscriptions/${subId}`);
    return docData(docRef, { idField: 'id' }) as Observable<
      Subscription | undefined
    >;
  }

  async deleteSub(sub: Subscription) {
    const subDocRef = doc(this._firestore, `subscriptions/${sub.id}`);

    await deleteDoc(subDocRef);
  }

  clearData() {
    // Réinitialiser les observables avec des valeurs vides
    this.userSubDataSubject.next([]);
    this.userDataSubject.next([]);
  }

  ngOnDestroy() {
    this.userDataSubject.next([]);
    this.userSubDataSubject.next([]);
  }
}
