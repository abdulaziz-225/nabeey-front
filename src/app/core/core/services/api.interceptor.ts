import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
// import { AuthService } from './auth.service';
// import { TranslateService } from '../transloco/translate.service';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {

  constructor(
    private authService: UserService,) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.authService.accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.authService.accessToken}`,
        },
        // withCredentials: true
      });
    }

    return next.handle(request);
  }
}
