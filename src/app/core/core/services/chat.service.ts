import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { ChatConversation, ChatConversationSummary, ChatMessage } from '../models/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(data: { userId: number; senderId: number; isFromAdmin: boolean; text: string }): Observable<ChatMessage> {
    return this.http.post<any>(`${this.apiUrl}/chat/send`, data).pipe(
      map(response => response.data)
    );
  }

  getMyConversation(userId: number): Observable<ChatConversation> {
    return this.http.get<any>(`${this.apiUrl}/chat/my-conversation/${userId}`).pipe(
      map(response => response.data)
    );
  }

  getConversation(conversationId: number): Observable<ChatConversation> {
    return this.http.get<any>(`${this.apiUrl}/chat/get/${conversationId}`).pipe(
      map(response => response.data)
    );
  }

  closeConversation(conversationId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chat/close/${conversationId}`, {});
  }

  markAsRead(conversationId: number, isAdmin: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chat/mark-read/${conversationId}?isAdmin=${isAdmin}`, {});
  }

  getAllConversations(search: string = ''): Observable<ChatConversationSummary[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<any>(`${this.apiUrl}/chat/get-all${query}`).pipe(
      map(response => response.data)
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/chat/unread-count`).pipe(
      map(response => response.data)
    );
  }
}
