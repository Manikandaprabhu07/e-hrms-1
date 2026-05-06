import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    const requiredRoles = route.data['roles'] as string[] || [];
    const currentUser = this.authService.user();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasRole = requiredRoles.length === 0
      ? true
      : requiredRoles.some(role => this.authService.hasRole(role));

    if (!hasRole) {
      this.router.navigate(['/access-denied']);
      return false;
    }

    return true;
  }
}
