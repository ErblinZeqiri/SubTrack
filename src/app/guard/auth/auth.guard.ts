import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * AuthGuard est un guard qui permet de proteger les routes en fonction de si l'utilisateur est authentifi .
 * Si l'utilisateur est d j  authentifi , le guard permet la navigation vers la route demand e.
 * Sinon, le guard redirige vers la page de connexion.
 *
 * @param route La route que l'utilisateur essaie de joindre.
 * @param state La state de la route que l'utilisateur essaie de joindre.
 * @returns Un boolean qui indique si l'utilisateur est autoris  acc der  la route.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Demande  l'utilisateur si il est authentifi
  const isLoggedIn = await firstValueFrom(auth.isAuthenticated());
  if (!environment.production) {
    console.log('🚦 AuthGuard: isAuthenticated() retourne', isLoggedIn);
  }

  // Si l'utilisateur n'est pas authentifi, on le redirige vers la page de connexion
  if (!isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }

  // Si l'utilisateur est authentifi, on le laisse acc der  la route
  return true;
};
