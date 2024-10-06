import { Injectable, Injector } from '@angular/core';
import { User, Subscription } from '../../../interfaces/interface';
import { BehaviorSubject, firstValueFrom, map, Observable, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private userSubDataSubject = new BehaviorSubject<Subscription[]>([]);
  userSubData$ = this.userSubDataSubject.asObservable();
  private userDataSubject = new BehaviorSubject<User[]>([]);
  userData$ = this.userDataSubject.asObservable();
  loadSubDataUrl = 'http://localhost:5050/subscriptions'; // URL vers ton backend Python

  constructor(private http: HttpClient) {}

  // Charger les données de l'utilisateur via le backend Python
  loadUserData(userID: string): Observable<User[]> {
    return this.http.get<User[]>(`http://localhost:5050/users/${userID}`);
  }

  // Charger les abonnements d'un utilisateur via le backend Python
  loadSubData(userID: string): Observable<Subscription[]> {
    return this.http
      .get<Subscription[]>(this.loadSubDataUrl, {
        params: { userID },
      })
      .pipe(tap((data) => this.userSubDataSubject.next(data)));
  }

  loadOneSubData(subId: string): Observable<Subscription> {
    return this.http.get<Subscription>(
      `http://localhost:5050/subscriptions/${subId}`
    );
  }

  // Supprimer un abonnement
  deleteSub(subId: string): Observable<void> {
    return this.http.delete<void>(
      `http://localhost:5050/subscriptions/${subId}`
    );
  }

  // Ajouter un nouvel abonnement
  addSubscription(sub: Subscription): Observable<Subscription> {
    return this.http.post<Subscription>(
      'http://localhost:5050/subscriptions',
      sub
    );
  }

  // Mettre à jour un abonnement existant
  updateSubscription(subId: string, sub: Subscription): Observable<void> {
    return this.http.put<void>(
      `http://localhost:5050/subscriptions/${subId}`,
      sub
    );
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
