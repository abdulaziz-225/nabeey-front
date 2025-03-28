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
              this.snackBar.open(`Success: ${req.method} request completed with status ${event.status}`, 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
          },
          (error: HttpErrorResponse) => {
            // Display error message
            this.snackBar.open(`Error: ${error.error.message}`, 'Close', {
              duration: 3000,
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
}