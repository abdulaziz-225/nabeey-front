import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      return next.handle(req).pipe(
        tap(
          (event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              this.snackBar.open(this.getSuccessMessage(req), 'Yopish', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
          },
          (error: HttpErrorResponse) => {
            const message = error.error?.message || error.error?.Message || "Nimadir xato ketdi, qaytadan urinib ko'ring";
            this.snackBar.open(message, 'Yopish', {
              duration: 3500,
              panelClass: ['error-snackbar']
            });
          }
        )
      );
    } else {
      // Pass through GET and other requests without interception
      return next.handle(req);
    }
  }

  private getSuccessMessage(req: HttpRequest<any>): string {
    const url = req.url.toLowerCase();

    if (url.includes('/auth/login')) {
      return 'Muvaffaqiyatli kirildi';
    }
    if (url.includes('/user/create')) {
      return "Muvaffaqiyatli ro'yxatdan o'tildi";
    }

    switch (req.method) {
      case 'POST':
        return "Muvaffaqiyatli qo'shildi";
      case 'PUT':
        return "Muvaffaqiyatli o'zgartirildi";
      case 'DELETE':
        return "Muvaffaqiyatli o'chirildi";
      default:
        return 'Muvaffaqiyatli bajarildi';
    }
  }
}