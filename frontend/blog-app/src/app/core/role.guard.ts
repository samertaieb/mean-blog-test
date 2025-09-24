import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const roleGuard = (roles: string[]): CanActivateFn => {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.user()) {
      const ok = await auth.tryRefresh();
      if (!ok) { router.navigateByUrl('/login'); return false; }
    }
    if (auth.hasAnyRole(roles)) return true;
    router.navigateByUrl('/');
    return false;
  };
};
