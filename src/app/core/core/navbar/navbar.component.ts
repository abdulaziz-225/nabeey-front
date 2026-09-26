import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  userRole: string | null
  unreadChatCount = 0;

  private unreadPollSub?: Subscription;

  constructor(private router: Router, private chatService: ChatService){
    const userRole = localStorage.getItem('role');
    let parseUserRole = null;
    if(userRole != null){
      parseUserRole = JSON.parse(userRole)
    }
    this.userRole = parseUserRole
  }

  ngOnInit(): void {
    if (this.userRole === 'User') return;

    this.loadUnreadCount();
    this.unreadPollSub = interval(6000)
      .pipe(switchMap(() => this.chatService.getUnreadCount().pipe(catchError(() => of(null)))))
      .subscribe(count => {
        if (count !== null) this.unreadChatCount = count;
      });
  }

  ngOnDestroy(): void {
    this.unreadPollSub?.unsubscribe();
  }

  loadUnreadCount(): void {
    this.chatService.getUnreadCount().pipe(catchError(() => of(null))).subscribe(count => {
      if (count !== null) this.unreadChatCount = count;
    });
  }

  openConfirmationLog(){
    localStorage.removeItem('userId'),
    this.router.navigate(['login'])
  }

}
