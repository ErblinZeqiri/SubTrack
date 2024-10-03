import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated().pipe(
    map((isAuth) => {
      if (!isAuth) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    })
  );
};