import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const parsedRole = role ? JSON.parse(role) : null;

    if (!userId) {
      this.router.navigate(['/login']);
      return false;
    }
    if (parsedRole !== 'SuperAdmin') {
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}
