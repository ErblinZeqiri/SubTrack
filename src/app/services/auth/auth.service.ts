import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { signInWithPopup, signOut } from '@firebase/auth';
import {
  FirebaseAuthentication,
  SignInWithOAuthOptions,
} from '@capacitor-firebase/authentication';

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

      const credential = await FirebaseAuthentication.signInWithGoogle();

      if (credential.user) {
        this.updateUserData(credential.user);
        setTimeout(() => this._router.navigate(['/home']));
      } else {
        console.error('User data not available');
      }
    } catch (error) {
      console.error('Login failed', error);
    }

    // const provider = new GoogleAuthProvider();
    // provider.setCustomParameters({
    //   prompt: 'select_account',
    // });
    // const credential = await signInWithPopup(this._auth, provider);
    // if (credential) {
    //   this.updateUserData(credential.user);
    //   setTimeout(() => this._router.navigate(['/home']));
    // }
  }

  async serviceLoginWithemail(email: string, password: string): Promise<void> {
    const credential = await signInWithEmailAndPassword(
      this._auth,
      email,
      password
    );
    if (credential) {
      this.updateUserData(credential.user);
      setTimeout(() => this._router.navigate(['/home']));
    }
  }

  serviceSigninWithEmail(email: string, password: string, fullName?: string) {
    createUserWithEmailAndPassword(this._auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        this.updateUserData(user);
        console.log(user);
        setTimeout(() => this._router.navigate(['/home']));
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(`Error ${errorCode}: ${errorMessage}`);
      });
  }

  async logout() {
    await this._auth.signOut();
    this.auth = false;
    localStorage.removeItem('user');
    window.location.reload();
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
}
