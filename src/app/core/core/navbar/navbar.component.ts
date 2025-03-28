import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  userRole: string | null
  constructor(private router: Router){
    const userRole = localStorage.getItem('role');
    let parseUserRole = null;
    if(userRole != null){
      parseUserRole = JSON.parse(userRole)
    }
    this.userRole = parseUserRole
  }


  openConfirmationLog(){
    localStorage.removeItem('userId'),
    this.router.navigate(['login'])
  }

}
