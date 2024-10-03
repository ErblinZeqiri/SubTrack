import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  user as firebaseUser,
  User,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  FirebaseAuthentication,
  SignInWithOAuthOptions,
} from '@capacitor-firebase/authentication';
import { doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { DataService } from '../data/data.service';
import { map, Observable, of, tap } from 'rxjs';
import { updateProfile } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth: boolean = false;
  private loginUrl = 'http://127.0.0.1:5050/login/';
  private logoutUrl = 'http://127.0.0.1:5050/logout/';

  constructor(
    private readonly _auth: Auth,
    private readonly _router: Router,
    private readonly _dataService: DataService,
    private http: HttpClient
  ) {}

  async serviceLoginWithGoogle() {
    try {
      const options: SignInWithOAuthOptions = {
        customParameters: [{ key: 'prompt', value: 'select_account' }],
        scopes: ['profile', 'email'],
        mode: 'popup',
      };

      const credential = await FirebaseAuthentication.signInWithGoogle(options);
      if (credential.user) {
        const userCredential = {
          email: credential.user.email,
          fullName: credential.user.displayName,
          uid: credential.user.uid,
        };

        const db = getFirestore();
        const docRef = doc(db, `users/${credential.user.uid}`);
        if (!docRef) {
          await setDoc(docRef, userCredential);
        }

        this._router.navigate(['/home']);
      } else {
        console.error('User data not available');
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  // async serviceLoginWithemail(email: string, password: string): Promise<void> {
  //   const credential = await signInWithEmailAndPassword(
  //     this._auth,
  //     email,
  //     password
  //   );
  //   if (credential) {
  //     this._router.navigate(['/home']);
  //   }
  // }

  serviceLoginWithemail(email: string, password: string): Observable<any> {
    const loginData = { email, password };
    return this.http
      .post<any>(this.loginUrl, loginData, {
        withCredentials: true,
      })
      .pipe(
        tap((data) => {
          console.log(data);
          localStorage.setItem('token', data.token);
          this._router.navigate(['/home']);
        })
      );
  }

  async serviceSigninWithEmail(
    email: string,
    password: string,
    fullName: string
  ) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this._auth,
        email,
        password
      );
      const user = userCredential.user;

      updateProfile(user, { displayName: fullName })
        .then(() => {
          // Profile updated!
        })
        .catch((error) => {
          // An error occurred
          console.log(error);
        });

      if (user) {
      } else {
        console.error('User data not available');
      }

      this._router.navigate(['/home']);
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error ${errorCode}: ${errorMessage}`);
    }
  }

  // async logout() {
  //   await this._auth.signOut();
  //   this.auth = false;
  //   this._dataService.clearData();
  //   await FirebaseAuthentication.signOut();
  //   this._router.navigate(['/login']);
  // }

  logout() {
    localStorage.removeItem('token');

    return this.http
      .post<any>(this.logoutUrl, {}, { withCredentials: true })
      .pipe(
        tap({
          next: () => {
            console.log('Déconnexion effectuée');
            this._router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Échec de la déconnexion', error);
            this._router.navigate(['/login']);
          },
        })
      );
  }

  isAuthenticated(): Observable<boolean> {
    const token = localStorage.getItem('token');

    if (!!token) {
      // Si un token est présent dans le localStorage, renvoyer un Observable qui retourne true
      return of(true); // 'of' crée un Observable qui émet une seule valeur
    }

    // Sinon, vérifier avec Firebase
    return firebaseUser(this._auth).pipe(
      map((user) => !!user) // Retourner true si un utilisateur Firebase est authentifié
    );
  }

  getCurrentUser(): Observable<User | null> {
    return firebaseUser(this._auth);
  }
}
