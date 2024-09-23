import { Injectable, Injector } from '@angular/core';
import { User, Subscription } from '../../../interfaces/interface';
import { BehaviorSubject, firstValueFrom, map, Observable, tap } from 'rxjs';
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
  onSnapshot,
} from '@angular/fire/firestore';
import { deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private userSubDataSubject = new BehaviorSubject<Subscription[]>([]);
  userSubData$ = this.userSubDataSubject.asObservable();
  private userDataSubject = new BehaviorSubject<User[]>([]);
  userData$ = this.userDataSubject.asObservable();

  private _auth!: AuthService;
  constructor(
    private readonly _firestore: Firestore,
    private injector: Injector
  ) {}

  loadUserData(userID: string): Observable<User[]> {
    this.userDataSubject.next([]);
    const fbCollection = collection(this._firestore, 'users');
    const byUserId: QueryConstraint = where(documentId(), '==', userID);
    const q = query(fbCollection, byUserId);
    const datas = collectionData(q, { idField: 'id' }) as Observable<User[]>;
    return datas.pipe(tap((data) => this.userDataSubject.next(data)));
  }

  async loadSubData(userID: string) {
    this.userSubDataSubject.next([]);
    if (!userID) {
      console.error('userID is null or undefined');
      return;
    }

    const fbCollection = collection(this._firestore, 'subscriptions');
    const byUserId: QueryConstraint = where('userID', '==', userID);
    const q = query(fbCollection, byUserId);
    onSnapshot(q, (querySnapshot) => {
      querySnapshot.docs.forEach((doc) => {
        const index = this.userSubDataSubject.value.findIndex(
          (sub) => sub.id === doc.id
        );
        if (index !== -1) {
          this.userSubDataSubject.value[index] = {
            ...(doc.data() as Subscription),
            id: doc.id,
          } as Subscription;
        } else {
          this.userSubDataSubject.value.push({
            ...(doc.data() as Subscription),
            id: doc.id,
          });
        }
      });
    });
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

  async addSubscription(sub: any) {
    const newSubRef = doc(collection(this._firestore, 'subscriptions'));
    await setDoc(newSubRef, sub);
  }

  async updateSubscription(subId: string, sub: any) {
    const subRef = doc(this._firestore, `subscriptions/${subId}`);
    await updateDoc(subRef, sub);
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
