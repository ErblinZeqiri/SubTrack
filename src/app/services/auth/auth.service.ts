import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/interfaces/interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth: boolean = false;
  private loginUrl = 'http://127.0.0.1:5050/login/';
  private isAuthenticatedUrl = 'http://127.0.0.1:5050/isAuthenticated';
  private userUrl = 'http://127.0.0.1:5050/users';
  token: string | null = localStorage.getItem('token');

  constructor(private readonly _router: Router, private http: HttpClient) {}
  async serviceLoginWithGoogle() {
    return undefined;
  }

  async serviceSigninWithEmail(
    email: string,
    password: string,
    fullName: string
  ) {
    return undefined;
  }

  async serviceLoginWithemail(
    email: string,
    password: string
  ): Promise<string | undefined> {
    const loginData = { email, password };
    try {
      if (loginData) {
        // Effectuer la requête de connexion vers le backend
        const response = await firstValueFrom(
          this.http.post<{ token: string }>(this.loginUrl, loginData, {
            withCredentials: true,
          })
        );
        // Vérifier si un token a été retourné
        if (response) {
          localStorage.setItem('token', response.token);
          return response.token; // Retourner le token si tout est correct
        } else {
          console.error('Aucun token retourné');
          return undefined; // Retourner undefined si aucun token n'est reçu
        }
      } else {
        console.error('Email ou mot de passe manquant');
        return undefined; // Retourner undefined si email ou mot de passe manquant
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return undefined; // Retourner undefined en cas d'erreur
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this._router.navigate(['/login']);
  }

  isAuthenticated(): Observable<boolean> {
    if (!this.token) {
      return of(false);
    }

    // Envoyer le token au backend pour vérifier sa validité
    return this.http
      .get(`${this.isAuthenticatedUrl}/`, {
        headers: { Authorization: `Bearer ${this.token}` },
        withCredentials: true,
      })
      .pipe(
        map(() => true), // Si la réponse est OK, l'utilisateur est authentifié
        catchError((e) => {
          console.log('Erreur:', e);

          return of(false);
        }) // En cas d'erreur, on considère que l'utilisateur n'est pas authentifié
      );
  }

  getCurrentUser(): Observable<User | null> {
    return this.http
      .get<User[]>(`${this.userUrl}/`, {
        headers: { Authorization: `Bearer ${this.token}` },
        withCredentials: true,
      })
      .pipe(map((response) => response[0] || null));
  }
}
