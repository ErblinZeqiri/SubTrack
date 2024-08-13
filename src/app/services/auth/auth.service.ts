import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  FirebaseAuthentication,
  SignInWithOAuthOptions,
} from '@capacitor-firebase/authentication';
import { doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth: boolean = false;
  constructor(private readonly _auth: Auth, private readonly _router: Router) {}

  async serviceLoginWithGoogle() {
    try {
      const options: SignInWithOAuthOptions = {
        customParameters: [{ key: 'prompt', value: 'select_account' }],
        scopes: ['profile', 'email'],
        mode: 'popup',
      };

      const credential = await FirebaseAuthentication.signInWithGoogle(options);
      if (credential.user) {
        this.updateUserData(credential.user);

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
      this.updateUserData(credential.user);
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

      if (user) {
      } else {
        console.error('User data not available');
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        fullName: fullName || null,
      };
      await this.saveFullNameIntoDB(userData);

      this.updateUserData(user);
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
    localStorage.removeItem('user');
    await FirebaseAuthentication.signOut();
    this._router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    if (user) {
      this.auth = true;
      return true;
    } else {
      this.auth = false;
      return false;
    }
  }

  private updateUserData(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.auth = true;
  }

  async saveFullNameIntoDB(userData: any) {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', userData.uid);

    await setDoc(userDocRef, userData, { merge: true });
  }
}
