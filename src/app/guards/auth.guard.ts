import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.currentUser();
    if (user?.isNewUser) {
      return router.navigate(['/onboarding']);
    }
    return true;
  }
  
  return router.navigate(['/login']);
};

export const onboardingGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (user && user.isNewUser) return true;
  if (user && !user.isNewUser) return router.navigate(['/app']);
  
  return router.navigate(['/login']);
};
