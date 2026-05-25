import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';

export const authGuard: CanActivateFn = async () => {
  const auth   = inject(Auth);
  const router = inject(Router);

  // Attendre que Firebase ait résolu l'état initial depuis le cache local.
  // Après cette promesse, auth.currentUser est fiable et synchrone.
  await auth.authStateReady();

  const isLoggedIn = !!auth.currentUser;

  if (!environment.production) {
    console.log('🚦 AuthGuard: currentUser =', auth.currentUser?.email ?? 'null');
  }

  if (!isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
