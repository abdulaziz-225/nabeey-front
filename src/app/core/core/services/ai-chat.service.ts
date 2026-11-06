import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { AiAskResponse, AiChatMessage, AiLimitResponse, AiModeAvailability } from '../models/ai-chat';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ask(question: string, history: AiChatMessage[], sessionId: string): Observable<AiAskResponse> {
    return this.http.post<any>(`${this.apiUrl}/ai/ask`, { question, history, sessionId }).pipe(
      map(response => response.data)
    );
  }

  askLibrary(question: string, history: AiChatMessage[], sessionId: string): Observable<AiAskResponse> {
    return this.http.post<any>(`${this.apiUrl}/ai/library/ask`, { question, history, sessionId }).pipe(
      map(response => response.data)
    );
  }

  getLimit(): Observable<AiLimitResponse> {
    return this.http.get<any>(`${this.apiUrl}/ai/limit`).pipe(
      map(response => response.data)
    );
  }

  getModeAvailability(): Observable<AiModeAvailability> {
    return this.http.get<any>(`${this.apiUrl}/ai/modes`).pipe(
      map(response => response.data)
    );
  }
}
