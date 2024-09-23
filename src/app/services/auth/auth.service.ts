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
import { map, Observable } from 'rxjs';
import { updateProfile } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth: boolean = false;
  constructor(
    private readonly _auth: Auth,
    private readonly _router: Router,
    private readonly _dataService: DataService
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

  async serviceLoginWithemail(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(
      this._auth,
      email,
      password
    );
    if (credential) {
      this._router.navigate(['/home']);
    }
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

  async logout() {
    await this._auth.signOut();
    this.auth = false;
    this._dataService.clearData();
    await FirebaseAuthentication.signOut();
    this._router.navigate(['/login']);
  }

  isAuthenticated(): Observable<boolean> {
    return firebaseUser(this._auth).pipe(map((user) => (user ? true : false)));
  }

  getCurrentUser(): Observable<User | null> {
    return firebaseUser(this._auth);
  }
}
