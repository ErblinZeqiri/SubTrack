import { Injectable, Injector } from '@angular/core';
import { User, Subscription, Payment } from '../../../interfaces/interface';
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  map,
  Observable,
  of,
  tap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private userSubDataSubject = new BehaviorSubject<Subscription[]>([]);
  userSubData$ = this.userSubDataSubject.asObservable();
  private userDataSubject = new BehaviorSubject<User[]>([]);
  userData$ = this.userDataSubject.asObservable();
  subscriptionsUrl = 'http://localhost:5050/subscriptions';
  userUrl = 'http://localhost:5050/users';
  token: string | null = localStorage.getItem('token');
  constructor(private http: HttpClient) {}

  // Charger les données de l'utilisateur via le backend Python
  loadUserData(userID: string): Observable<User[]> {
    console.log('loadUserData', userID);
    return this.http.get<User[]>(`${this.userUrl}/${userID}`);
  }

  // Charger les abonnements d'un utilisateur via le backend Python
  loadSubData(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.subscriptionsUrl}/`, {
      headers: { Authorization: `Bearer ${this.token}` },
      withCredentials: true,
    });
  }

  loadOneSubData(subId: string): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.subscriptionsUrl}/${subId}`);
  }

  // Supprimer un abonnement
  deleteSub(subId: string): Observable<void> {
    console.log('deleteSub', subId);
    return this.http.delete<void>(`${this.subscriptionsUrl}/${subId}`, {
      headers: { Authorization: `Bearer ${this.token}` },
      withCredentials: true,
    });
  }

  // Ajouter un nouvel abonnement
  addSubscription(sub: Subscription): Observable<Subscription> {
    // Envoyez l'objet Subscription mis à jour au backend
    return this.http.post<Subscription>(`${this.subscriptionsUrl}/`, sub, {
      headers: { Authorization: `Bearer ${this.token}` },
      withCredentials: true,
    });
  }

  // Mettre à jour un abonnement existant
  updateSubscription(subId: string, sub: Subscription): Observable<void> {
    return this.http.put<void>(`${this.subscriptionsUrl}/${subId}`, sub);
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
