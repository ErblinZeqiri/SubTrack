import { Injectable, Injector } from '@angular/core';
import { User, Subscription } from '../../../interfaces/interface';
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

  constructor(private http: HttpClient) {}

  // Charger les données de l'utilisateur via le backend Python
  loadUserData(userID: string): Observable<User[]> {
    console.log('loadUserData', userID);
    return this.http.get<User[]>(`${this.userUrl}/${userID}`);
  }

  // Charger les abonnements d'un utilisateur via le backend Python
  loadSubData(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.subscriptionsUrl).pipe(
      tap((data) => {
        console.log('Données reçues:', data);
        this.userSubDataSubject.next(data);
      }),
      catchError((error) => {
        console.error('Erreur lors du chargement des abonnements', error);
        return of([]);
      })
    );
  }

  loadOneSubData(subId: string): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.subscriptionsUrl}/${subId}`);
  }

  // Supprimer un abonnement
  deleteSub(subId: string): Observable<void> {
    return this.http.delete<void>(`${this.subscriptionsUrl}/${subId}`);
  }

  // Ajouter un nouvel abonnement
  addSubscription(sub: Subscription): Observable<Subscription> {
    return this.http.post<Subscription>(this.subscriptionsUrl, sub);
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
