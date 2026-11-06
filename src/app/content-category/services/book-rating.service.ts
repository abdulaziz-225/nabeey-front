import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { BookRatingSummary, BookStat, StatPeriod } from '../models/book-comment';

@Injectable({
  providedIn: 'root'
})
export class BookRatingService {

  private apiUrl: string = `${environment.apiUrl}/book-ratings`;

  constructor(private http: HttpClient) { }

  getSummary(bookId: number): Observable<BookRatingSummary> {
    return this.http.get<any>(`${this.apiUrl}/book/${bookId}`).pipe(map(res => res.data));
  }

  rate(bookId: number, stars: number): Observable<BookRatingSummary> {
    return this.http.put<any>(`${this.apiUrl}/book/${bookId}`, { stars }).pipe(map(res => res.data));
  }

  // Har bir kitob uchun ko'rishlar (davr bo'yicha), izohlar, reyting va mos test
  getStats(period: StatPeriod = 'all'): Observable<BookStat[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<any>(`${this.apiUrl}/stats`, { params }).pipe(map(res => res.data ?? []));
  }
}
