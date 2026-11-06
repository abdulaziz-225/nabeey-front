import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { BookComment, BookCommentLikeResult } from '../models/book-comment';

@Injectable({
  providedIn: 'root'
})
export class BookCommentService {

  private apiUrl: string = `${environment.apiUrl}/book-comments`;

  constructor(private http: HttpClient) { }

  getByBook(bookId: number): Observable<BookComment[]> {
    return this.http.get<any>(`${this.apiUrl}/book/${bookId}`).pipe(map(res => res.data ?? []));
  }

  // { [bookId]: izohlar soni }
  getCounts(): Observable<Record<number, number>> {
    return this.http.get<any>(`${this.apiUrl}/counts`).pipe(map(res => res.data ?? {}));
  }

  // parentId berilsa — izohga javob
  create(bookId: number, text: string, parentId: number | null = null): Observable<BookComment> {
    return this.http.post<any>(`${this.apiUrl}/create`, { bookId, text, parentId }).pipe(map(res => res.data));
  }

  // Layk bosish / qaytarib olish
  toggleLike(id: number): Observable<BookCommentLikeResult> {
    return this.http.post<any>(`${this.apiUrl}/${id}/like`, null).pipe(map(res => res.data));
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`).pipe(map(res => res.data));
  }
}
