import { Injectable } from '@angular/core';
import {  ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router){}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

      const userId = localStorage.getItem('userId');

      let parseUserId = null;
      if (userId != null) {
        parseUserId = JSON.parse(userId);
      }

      const userRole = localStorage.getItem('role');
      let parseUserRole = null;
      if (userRole != null){
        parseUserRole = JSON.parse(userRole)
      }

      if(parseUserId){
        if(parseUserRole === 'User'){
          const allowedRoutes = ['/profile', '/article', '/videos', '/category', '/books', '/quiz', '/home'];
          if(allowedRoutes.includes(state.url)){
            return true
          } else{
            this.router.navigate(['/home']); 
            return false;
          }
        } else{
          return true
        }
      } else{
        this.router.navigate(['/login'])
      }
      return false
  }
  
}
