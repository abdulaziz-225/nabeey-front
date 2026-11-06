import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Backend fayl URL'larini "https://localhost:7267/Images/..." ko'rinishida saqlaydi.
// Boshqa kompyuterda ular ochilmaydi, shuning uchun nisbiy yo'lga ("/Images/...") aylantiramiz —
// ng serve proxy ularni backend'ga yo'naltiradi.
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?=\/)/i;

@Injectable()
export class LocalhostUrlInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map(event => req.responseType === 'json' && event instanceof HttpResponse && event.body && typeof event.body === 'object'
        ? event.clone({ body: this.rewrite(event.body) })
        : event)
    );
  }

  private rewrite(value: any): any {
    if (typeof value === 'string') {
      return value.replace(LOCALHOST_ORIGIN, '');
    }
    if (Array.isArray(value)) {
      return value.map(v => this.rewrite(v));
    }
    if (value && typeof value === 'object') {
      const result: any = {};
      for (const key of Object.keys(value)) {
        result[key] = this.rewrite(value[key]);
      }
      return result;
    }
    return value;
  }
}
