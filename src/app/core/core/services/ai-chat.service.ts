import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { AiAskResponse, AiChatMessage, AiLimitResponse } from '../models/ai-chat';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ask(question: string, history: AiChatMessage[]): Observable<AiAskResponse> {
    return this.http.post<any>(`${this.apiUrl}/ai/ask`, { question, history }).pipe(
      map(response => response.data)
    );
  }

  getLimit(): Observable<AiLimitResponse> {
    return this.http.get<any>(`${this.apiUrl}/ai/limit`).pipe(
      map(response => response.data)
    );
  }
}
