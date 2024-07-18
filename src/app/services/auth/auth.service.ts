import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { signInWithPopup, signOut } from '@firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth: boolean = false;
  constructor(private readonly _auth: Auth, private readonly _router: Router) {}

  async login() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    const credential = await signInWithPopup(this._auth, provider);
    if (credential) {
      localStorage.setItem('user', JSON.stringify(credential.user));
      this.auth = true;
      setTimeout(() => this._router.navigate(['/home']));
    }
  }

  async logout() {
    await signOut(this._auth);
    this.auth = false;
    localStorage.removeItem('user');
    setTimeout(() => this._router.navigate(['/login']), 3000);
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
}
